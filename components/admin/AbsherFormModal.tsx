"use client";
/* eslint-disable @next/next/no-img-element */
import { InboxOutlined } from "@ant-design/icons";
import { App, AutoComplete, Button, Form, Input, Modal, Upload } from "antd";
import { useEffect, useMemo, useState } from "react";
import { absherFields, absherSections, type AbsherField } from "@/lib/absherFields";
import { getErrorMessage } from "@/lib/api";
import { maxUploadMb } from "@/lib/site";
import type { AbsherDetails, AdminAbsher } from "@/lib/types";
import { ABSHER_FOLDER, cdnImageUrl, uploadImage } from "@/lib/uploadImage";
import { useDeleteAbsher, useSaveAbsher } from "./useAdmin";

/**
 * "Add New Absher" / "Edit Absher" pop-up form (opened from AbsherDashboard).
 *
 * Fields: app login (name, resident ID, PIN), the detail sections in app order
 * (see lib/absherFields.ts), the profile photo (required) and the Absher card
 * image (optional).
 *
 * Save order – nothing is uploaded until the details were accepted:
 *   1. send the text details: POST /api/admin/absher (new) or PATCH /{id} (edit).
 *      The server checks every field and the resident ID here.
 *   2. for each newly chosen image: upload it (lib/uploadImage.ts), then attach
 *      its key straight away with PATCH /{id} – so every uploaded file belongs to
 *      the account at once.
 *   3. a new account whose image step fails is deleted again (with any image
 *      already attached), so no half-made account or stray file is left behind.
 * The server checks everything again – the checks here just give faster feedback.
 */

// Image types the admin may pick (the server re-checks the real file content)
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

// Starting values: the account's details when editing, defaults/empty for a new one
const initialValuesFor = (record?: AdminAbsher) =>
  Object.fromEntries(absherFields.map(f => [f.key, record ? (record[f.key] ?? "") : (f.initial ?? "")])) as AbsherDetails;

// Extra form rules per field (besides required + max length)
const extraRules = (field: AbsherField) => {
  // PIN: any characters, at least 4 (max length comes from absherFields)
  if (field.key === "pin") return [{ min: 4, message: "PIN must be 4–20 characters" }];
  if (field.key === "residentId") return [{ pattern: /^[A-Za-z0-9]{4,20}$/, message: "4–20 letters or digits" }];
  return [];
};

// ---------- One image picker (preview + replace) ----------

type ImageFieldProps = {
  label: string;
  required?: boolean;
  file: File | null;
  currentUrl?: string; // existing image when editing
  error: string;
  onPick: (file: File | null, error: string) => void;
};

const ImageField = ({ label, required, file, currentUrl, error, onPick }: ImageFieldProps) => {
  // Preview: the newly picked file (temporary blob: URL) or the current image
  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : currentUrl || undefined), [file, currentUrl]);
  // Free the temporary blob: URL when the preview changes or the form closes
  useEffect(() => {
    return () => {
      if (file && previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [file, previewUrl]);

  // Called by antd Upload when a file is chosen; validates it and hands it up
  const pick = (picked: File) => {
    if (!ALLOWED_TYPES.includes(picked.type)) onPick(file, "Please choose a JPG, PNG or WebP image.");
    else if (picked.size > maxUploadMb * 1024 * 1024) onPick(file, `This image is too large. Maximum size is ${maxUploadMb} MB.`);
    else onPick(picked, "");
    return false; // upload happens when the form is saved
  };

  return (
    <Form.Item
      label={required ? label : `${label} (optional)`}
      required={required}
      validateStatus={error ? "error" : undefined}
      help={error || `JPG, PNG or WebP, up to ${maxUploadMb} MB`}
    >
      {/* Image chosen (or existing) -> preview + replace button; otherwise drag & drop area */}
      {previewUrl ? (
        <div className="rounded-xl border border-line bg-brand-50/50 p-3">
          <img src={previewUrl} alt={label} className="mx-auto max-h-44 rounded-lg object-contain" />
          <div className="mt-3 flex justify-center">
            <Upload accept=".jpg,.jpeg,.png,.webp" showUploadList={false} beforeUpload={pick}>
              <Button>Choose another image</Button>
            </Upload>
          </div>
        </div>
      ) : (
        <Upload.Dragger accept=".jpg,.jpeg,.png,.webp" showUploadList={false} beforeUpload={pick}>
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">Upload {label}</p>
          <p className="ant-upload-hint">Click or drag the image here</p>
        </Upload.Dragger>
      )}
    </Form.Item>
  );
};

// ---------- The form ----------

// Mounted fresh each time it opens, so no state needs resetting
type Props = {
  open: boolean;
  record?: AdminAbsher;
  onClose: () => void;
  onCreated?: (record: AdminAbsher) => void;
};

const AbsherFormModal = ({ open, record, onClose, onCreated }: Props) => {
  const { message } = App.useApp();
  const [form] = Form.useForm<AbsherDetails>();
  const save = useSaveAbsher();
  const remove = useDeleteAbsher(); // undo a new account if its image step fails
  // Newly chosen images (not uploaded yet) and their error messages
  const [photo, setPhoto] = useState<{ file: File | null; error: string }>({ file: null, error: "" });
  const [card, setCard] = useState<{ file: File | null; error: string }>({ file: null, error: "" });
  const [uploading, setUploading] = useState(false); // image upload in progress (before the save request)
  const busy = uploading || save.isLoading || remove.isLoading;

  // Submit: save the details first, then upload + attach each new image (see the top of this file)
  const onFinish = async (values: AbsherDetails) => {
    // The photo is required: a new account needs one picked, an existing one may already have it
    if (!photo.file && !record?.photoKey) {
      setPhoto(p => ({ ...p, error: "Please upload the profile photo." }));
      message.error("Please upload the profile photo.");
      return;
    }

    // 1. Details first – a rejected form (bad field, duplicate ID) uploads nothing
    let saved: AdminAbsher;
    try {
      saved = await save.mutateAsync({ id: record?.id, body: values });
    } catch (error) {
      console.error("Save Absher failed:", error);
      message.error(getErrorMessage(error));
      return;
    }

    // 2. Upload each new image and attach it to the account immediately
    try {
      setUploading(true);
      for (const [image, field] of [
        [photo.file, "photoKey"],
        [card.file, "cardKey"],
      ] as const) {
        if (!image) continue;
        const key = await uploadImage(image, ABSHER_FOLDER);
        saved = await save.mutateAsync({ id: saved.id, body: { [field]: key } });
      }
    } catch (error) {
      console.error("Absher image upload failed:", error);
      if (!record) {
        // 3. New account: remove it again (the server deletes any attached image too)
        await remove.mutateAsync(saved.id).catch(() => undefined);
        message.error(`The account was not created because an image could not be uploaded. ${getErrorMessage(error)}`);
      } else {
        // Existing account: the details are saved; only the image needs another try
        setPhoto(p => ({ ...p, file: null }));
        setCard(c => ({ ...c, file: null }));
        message.error(`Details saved, but an image could not be uploaded. Please choose it again. ${getErrorMessage(error)}`);
      }
      return;
    } finally {
      setUploading(false);
    }

    message.success(record ? "Changes saved" : "Absher account created");
    onClose();
    // New account: let the dashboard open its details straight away
    if (!record) onCreated?.(saved);
  };

  return (
    <Modal
      open={open}
      title={record ? "Edit Absher" : "Add New Absher"}
      onCancel={onClose}
      footer={null}
      destroyOnHidden
      maskClosable={!busy}
      width={720}
    >
      <Form<AbsherDetails>
        form={form}
        layout="vertical"
        requiredMark={false}
        onFinish={onFinish}
        // A failed field rule (e.g. empty name) also gets a toast, so a click never looks ignored
        onFinishFailed={() => message.error("Please fix the highlighted fields.")}
        initialValues={initialValuesFor(record)}
        className="!mt-4"
      >
        {/* Text fields, grouped like the sections in the app */}
        {absherSections.map(section => (
          <fieldset key={section.title} className="mb-2 border-b border-line pb-2">
            <legend className="mb-3 font-semibold text-brand-600">{section.title}</legend>
            <div className="grid gap-x-3 sm:grid-cols-2">
              {section.fields.map(field => (
                <Form.Item
                  key={field.key}
                  name={field.key}
                  label={field.required ? field.label : `${field.label} (optional)`}
                  rules={[
                    { required: field.required, whitespace: field.required, message: `Please enter the ${field.label.toLowerCase()}` },
                    { max: field.max, message: `${field.label} must be ${field.max} characters or fewer` },
                    ...extraRules(field),
                  ]}
                >
                  {/* Suggestions where the values are usually the same; free text still allowed */}
                  {field.options ? (
                    <AutoComplete
                      options={field.options.map(value => ({ value }))}
                      placeholder={field.placeholder}
                      maxLength={field.max}
                      filterOption={(input, option) => String(option?.value).toLowerCase().includes(input.toLowerCase())}
                    />
                  ) : (
                    // dir="auto" keeps Arabic values (e.g. sponsor name) right-to-left
                    <Input dir="auto" maxLength={field.max} placeholder={field.placeholder} />
                  )}
                </Form.Item>
              ))}
            </div>
          </fieldset>
        ))}

        {/* Images: profile photo (required) and Absher card (optional) */}
        <div className="grid gap-x-3 sm:grid-cols-2">
          <ImageField
            label="Profile Photo"
            required
            file={photo.file}
            currentUrl={cdnImageUrl(record?.photoKey)}
            error={photo.error}
            onPick={(file, error) => setPhoto({ file, error })}
          />
          <ImageField
            label="Absher Card"
            file={card.file}
            currentUrl={cdnImageUrl(record?.cardKey)}
            error={card.error}
            onPick={(file, error) => setCard({ file, error })}
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button type="primary" htmlType="submit" loading={busy}>
            {record ? "Save Changes" : "Save Absher"}
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default AbsherFormModal;
