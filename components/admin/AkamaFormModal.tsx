"use client";
/* eslint-disable @next/next/no-img-element */
import { InboxOutlined } from "@ant-design/icons";
import { Alert, App, Button, Form, Input, Modal, Radio, Upload } from "antd";
import { useEffect, useMemo, useState } from "react";
import { getErrorMessage } from "@/lib/api";
import { uploadImage } from "@/lib/uploadImage";
import { maxUploadMb } from "@/lib/site";
import { akamaFields, akamaSections } from "@/lib/akamaFields";
import type { AdminAkama, AkamaDetails } from "@/lib/types";
import { PUBLIC_WARNING } from "./akamaUtils";
import { useDeleteAkama, useSaveAkama } from "./useAdmin";

/**
 * "Add New Akama" / "Edit Akama" pop-up form (opened from AkamaDashboard).
 *
 * Fields: the certificate details (Arabic labels, same order as the public card –
 * see lib/akamaFields.ts), image (with preview) and visibility.
 *
 * Save order – nothing is uploaded until the details were accepted:
 *   1. send the details: POST /api/admin/akama (new) or PATCH /{id} (edit). The
 *      server checks every field here. A record without an image stays private.
 *   2. if a new image was chosen: upload it (lib/uploadImage.ts), then attach its
 *      key straight away together with the chosen visibility (PATCH /{id}).
 *   3. a new record whose image step fails is deleted again (with its image), so
 *      no half-made record or stray file is left behind.
 * The server checks everything again – the checks here just give faster feedback.
 */

// Image types the admin may pick (the server re-checks the real file content)
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

// Form field values
type Values = AkamaDetails & { isPublic: boolean };

// Starting values: the record's details when editing, empty strings for a new record
const initialValuesFor = (record?: AdminAkama): Values => ({
  ...(Object.fromEntries(akamaFields.map(f => [f.key, record?.[f.key] ?? ""])) as AkamaDetails),
  isPublic: record?.isPublic ?? false,
});

// Mounted fresh each time it opens, so no state needs resetting
type Props = {
  open: boolean;
  record?: AdminAkama;
  onClose: () => void;
  onCreated?: (record: AdminAkama) => void;
};

const AkamaFormModal = ({ open, record, onClose, onCreated }: Props) => {
  const { message } = App.useApp();
  const [form] = Form.useForm<Values>();
  const isPublic = Form.useWatch("isPublic", form); // live value, to show the public warning
  const save = useSaveAkama();
  const remove = useDeleteAkama(); // undo a new record if its image step fails
  const [file, setFile] = useState<File | null>(null); // newly chosen image (not uploaded yet)
  const [fileError, setFileError] = useState(""); // message under the image field
  const [uploading, setUploading] = useState(false); // image upload in progress (before the save request)
  const busy = uploading || save.isLoading || remove.isLoading;

  // Preview: the newly picked file (temporary blob: URL) or, when editing, the current image
  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : record?.imageUrl), [file, record]);
  // Free the temporary blob: URL when the preview changes or the form closes
  useEffect(() => {
    return () => {
      if (file && previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [file, previewUrl]);

  // Called by antd Upload when a file is chosen; validates it and keeps it in state
  const pickFile = (picked: File) => {
    if (!ALLOWED_TYPES.includes(picked.type)) {
      setFileError("Please choose a JPG, PNG or WebP image.");
    } else if (picked.size > maxUploadMb * 1024 * 1024) {
      setFileError(`This image is too large. Maximum size is ${maxUploadMb} MB.`);
    } else {
      setFile(picked);
      setFileError("");
    }
    return false; // upload happens when the form is saved
  };

  // Submit: save the details first, then upload + attach a new image (see the top of this file)
  const onFinish = async (values: Values) => {
    // An image is required: a new record needs one picked, an existing one may already have it
    const hasImage = !!record?.imageUrl;
    if (!file && !hasImage) {
      setFileError("Please upload the Akama image.");
      message.error("Please upload the Akama image.");
      return;
    }

    // 1. Details first – a rejected form uploads nothing. Without an image yet, keep it private.
    let saved: AdminAkama;
    try {
      saved = await save.mutateAsync({ id: record?.id, body: { ...values, isPublic: hasImage ? values.isPublic : false } });
    } catch (error) {
      // Logged so the exact failing request is visible in the browser console
      console.error("Save Akama failed:", error);
      message.error(getErrorMessage(error));
      return;
    }

    // 2. New image: upload it, then attach it together with the chosen visibility
    if (file) {
      try {
        setUploading(true);
        const imageKey = await uploadImage(file);
        saved = await save.mutateAsync({ id: saved.id, body: { imageKey, isPublic: values.isPublic } });
      } catch (error) {
        console.error("Akama image upload failed:", error);
        if (!record) {
          // 3. New record: remove it again (the server deletes its image too)
          await remove.mutateAsync(saved.id).catch(() => undefined);
          message.error(`The record was not created because the image could not be uploaded. ${getErrorMessage(error)}`);
        } else {
          // Existing record: details are saved; only the image needs another try
          setFile(null);
          message.error(`Details saved, but the image could not be uploaded. Please choose it again. ${getErrorMessage(error)}`);
        }
        return;
      } finally {
        setUploading(false);
      }
    }

    message.success(record ? "Changes saved" : "Akama record created");
    onClose();
    // New record: let the dashboard open its details + QR code straight away
    if (!record) onCreated?.(saved);
  };

  return (
    <Modal
      open={open}
      title={record ? "Edit Akama" : "Add New Akama"}
      onCancel={onClose}
      footer={null}
      destroyOnHidden
      maskClosable={!busy}
      width={680}
    >
      <Form<Values>
        form={form}
        layout="vertical"
        requiredMark={false}
        onFinish={onFinish}
        // A failed field rule (e.g. empty name) also gets a toast, so a click never looks ignored
        onFinishFailed={() => message.error("Please fix the highlighted fields.")}
        initialValues={initialValuesFor(record)}
        className="!mt-4"
      >
        {/* Certificate details, grouped like the card: Arabic label + English meaning */}
        {akamaSections.map(section => (
          <fieldset key={section.title} className="mb-2 border-b border-line pb-2">
            <legend className="mb-3 font-semibold text-brand-600">
              <span dir="rtl">{section.title}</span> <span className="text-xs font-normal text-ink-soft">({section.hint})</span>
            </legend>
            <div className="grid gap-x-3 sm:grid-cols-2">
              {section.fields.map(field => (
                <Form.Item
                  key={field.key}
                  name={field.key}
                  label={
                    <span>
                      <span dir="rtl">{field.label}</span>{" "}
                      <span className="text-xs text-ink-soft">
                        ({field.hint}
                        {field.optional && ", optional"})
                      </span>
                    </span>
                  }
                  // Optional fields only get the length check
                  rules={[
                    { required: !field.optional, whitespace: !field.optional, message: `Please enter the ${field.hint.toLowerCase()}` },
                    { max: field.max, message: `${field.hint} must be ${field.max} characters or fewer` },
                  ]}
                >
                  <Input dir="auto" maxLength={field.max} />
                </Form.Item>
              ))}
            </div>
          </fieldset>
        ))}

        <Form.Item
          label="Akama Image"
          required
          validateStatus={fileError ? "error" : undefined}
          help={fileError || `JPG, PNG or WebP, up to ${maxUploadMb} MB`}
        >
          {/* Image chosen (or existing) -> preview + replace button; otherwise drag & drop area */}
          {previewUrl ? (
            <div className="rounded-xl border border-line bg-brand-50/50 p-3">
              <img src={previewUrl} alt="Selected Akama" className="mx-auto max-h-56 rounded-lg object-contain" />
              <div className="mt-3 flex justify-center">
                <Upload accept=".jpg,.jpeg,.png,.webp" showUploadList={false} beforeUpload={pickFile}>
                  <Button>{file || record ? "Choose another image" : "Upload Image"}</Button>
                </Upload>
              </div>
            </div>
          ) : (
            <Upload.Dragger accept=".jpg,.jpeg,.png,.webp" showUploadList={false} beforeUpload={pickFile}>
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">Upload Image</p>
              <p className="ant-upload-hint">Click or drag the Akama photo here</p>
            </Upload.Dragger>
          )}
        </Form.Item>

        <Form.Item label="Visibility" name="isPublic">
          <Radio.Group className="!grid w-full gap-2 sm:!grid-cols-2">
            <Radio value={false} className="!m-0 rounded-xl border border-line p-3">
              <span className="font-medium">Private</span>
              <span className="block text-xs text-ink-soft">Only visible in this admin panel</span>
            </Radio>
            <Radio value={true} className="!m-0 rounded-xl border border-line p-3">
              <span className="font-medium">Public</span>
              <span className="block text-xs text-ink-soft">Anyone with the link can view it</span>
            </Radio>
          </Radio.Group>
        </Form.Item>

        {/* Privacy reminder whenever "Public" is selected */}
        {isPublic && <Alert type="warning" showIcon className="!mb-5" title="This record will be public" description={PUBLIC_WARNING} />}

        <div className="flex justify-end gap-2">
          <Button onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button type="primary" htmlType="submit" loading={busy}>
            {record ? "Save Changes" : "Save Akama"}
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default AkamaFormModal;
