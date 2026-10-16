"use client";
import { Alert, App, Button, Form, Input, Modal } from "antd";
import { getErrorMessage } from "@/lib/api";
import { useUpdateAccount } from "./useAdmin";

/**
 * "Account settings" pop-up (opened from the top bar in AdminShell).
 *
 * Lets the administrator change the login email and/or PIN at any time.
 * The current PIN is always required. Sends PATCH /api/auth/account; after a
 * change every other logged-in browser/device is signed out automatically.
 */

// Form field values (blank new PIN = keep the current one)
type Values = { email: string; currentPassword: string; newPassword?: string; confirmPassword?: string };

type Props = {
  open: boolean;
  email: string; // current login email (pre-filled)
  onClose: () => void;
};

const AccountSettingsModal = ({ open, email, onClose }: Props) => {
  const { message } = App.useApp();
  const [form] = Form.useForm<Values>();
  const update = useUpdateAccount();

  // Only send what actually changed
  const onFinish = async (values: Values) => {
    const newEmail = values.email.trim().toLowerCase();
    const emailChanged = newEmail !== email;
    if (!emailChanged && !values.newPassword) {
      message.info("Nothing to change.");
      return;
    }
    try {
      await update.mutateAsync({
        currentPassword: values.currentPassword,
        ...(emailChanged && { email: newEmail }),
        ...(values.newPassword && { newPassword: values.newPassword }),
      });
      message.success("Account updated. Other sessions have been logged out.");
      onClose();
    } catch (error) {
      message.error(getErrorMessage(error));
    }
  };

  return (
    <Modal
      open={open}
      title="Account settings"
      onCancel={onClose}
      footer={null}
      destroyOnHidden
      maskClosable={!update.isLoading}
      width={480}
    >
      <Form<Values>
        form={form}
        layout="vertical"
        requiredMark={false}
        onFinish={onFinish}
        onFinishFailed={() => message.error("Please fix the highlighted fields.")}
        initialValues={{ email }}
        className="!mt-4"
      >
        <Form.Item
          label="Login email"
          name="email"
          rules={[
            { required: true, message: "Please enter the email" },
            { type: "email", message: "Please enter a valid email address" },
          ]}
        >
          <Input size="large" autoComplete="email" />
        </Form.Item>

        <Form.Item
          label="New PIN"
          name="newPassword"
          extra="Leave empty to keep the current PIN. At least 6 characters."
          rules={[{ min: 6, message: "New PIN must be at least 6 characters" }, { max: 100 }]}
        >
          <Input.Password size="large" autoComplete="new-password" />
        </Form.Item>

        {/* Must match "New PIN" (only required when a new PIN is typed) */}
        <Form.Item
          label="Confirm new PIN"
          name="confirmPassword"
          dependencies={["newPassword"]}
          rules={[
            ({ getFieldValue }) => ({
              validator(_, value) {
                const pin = getFieldValue("newPassword");
                if (!pin || value === pin) return Promise.resolve();
                return Promise.reject(new Error("The two PINs do not match"));
              },
            }),
          ]}
        >
          <Input.Password size="large" autoComplete="new-password" />
        </Form.Item>

        <Form.Item
          label="Current PIN"
          name="currentPassword"
          rules={[{ required: true, message: "Please enter your current PIN to confirm" }]}
        >
          <Input.Password size="large" autoComplete="current-password" />
        </Form.Item>

        <Alert
          type="info"
          showIcon
          className="!mb-5"
          title="After saving, any other browser or device where you are logged in will be signed out."
        />

        <div className="flex justify-end gap-2">
          <Button onClick={onClose} disabled={update.isLoading}>
            Cancel
          </Button>
          <Button type="primary" htmlType="submit" loading={update.isLoading}>
            Save Changes
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default AccountSettingsModal;
