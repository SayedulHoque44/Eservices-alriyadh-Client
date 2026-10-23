"use client";
import { Descriptions, Empty, Image, Modal, Button, Typography } from "antd";
import { absherSections } from "@/lib/absherFields";
import type { AdminAbsher } from "@/lib/types";
import { cdnImageUrl } from "@/lib/uploadImage";
import { formatDate } from "./akamaUtils";

/**
 * "Absher Details" pop-up (opened by View in the table, and automatically
 * right after a new account is created).
 *
 * Shows the profile photo and Absher card image, every detail section in app
 * order (see lib/absherFields.ts) and the account dates. No public link or QR
 * code – Absher accounts are only seen by the person in the app.
 */
type Props = {
  record: AdminAbsher | null;
  onClose: () => void;
  onEdit: (record: AdminAbsher) => void;
};

// Values that should get a copy button (IDs and the PIN)
const COPYABLE = new Set(["residentId", "pin", "sponsorId", "passportNumber"]);

const AbsherViewModal = ({ record, onClose, onEdit }: Props) => (
  <Modal
    open={!!record}
    title="Absher Details"
    onCancel={onClose}
    width={720}
    footer={
      record && [
        <Button key="close" onClick={onClose}>
          Close
        </Button>,
        <Button key="edit" type="primary" onClick={() => onEdit(record)}>
          Edit
        </Button>,
      ]
    }
  >
    {record && (
      <div className="mt-4 space-y-5">
        {/* Profile photo + Absher card from the CDN (click to enlarge) */}
        <div className="grid gap-4 sm:grid-cols-[200px_1fr]">
          <div className="flex items-center justify-center rounded-xl bg-brand-50/60 p-3">
            <Image src={cdnImageUrl(record.photoKey)} alt={`Photo of ${record.name}`} style={{ maxHeight: 220, objectFit: "contain" }} />
          </div>
          <div className="flex items-center justify-center rounded-xl border border-line p-3">
            {record.cardKey ? (
              <Image src={cdnImageUrl(record.cardKey)} alt={`Absher card of ${record.name}`} style={{ maxHeight: 220, objectFit: "contain" }} />
            ) : (
              <Empty description="No Absher card image" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )}
          </div>
        </div>

        {/* Details, one table per app section */}
        {absherSections.map(section => (
          <Descriptions
            key={section.title}
            column={1}
            bordered
            size="small"
            title={<span className="text-brand-600">{section.title}</span>}
            styles={{ label: { width: 230 } }}
          >
            {section.fields.map(field => {
              const value = record[field.key];
              return (
                <Descriptions.Item key={field.key} label={field.label}>
                  {!value ? (
                    <span className="text-ink-soft">—</span>
                  ) : COPYABLE.has(field.key) ? (
                    <Typography.Text copyable dir="auto">
                      {value}
                    </Typography.Text>
                  ) : (
                    // dir="auto" keeps Arabic values right-to-left
                    <span dir="auto">{value}</span>
                  )}
                </Descriptions.Item>
              );
            })}
          </Descriptions>
        ))}

        <Descriptions column={1} bordered size="small" title="Record" styles={{ label: { width: 230 } }}>
          <Descriptions.Item label="Created">{formatDate(record.createdAt)}</Descriptions.Item>
          <Descriptions.Item label="Last updated">{formatDate(record.updatedAt)}</Descriptions.Item>
        </Descriptions>
      </div>
    )}
  </Modal>
);

export default AbsherViewModal;
