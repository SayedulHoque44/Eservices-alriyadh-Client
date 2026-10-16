"use client";
import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  GlobalOutlined,
  LinkOutlined,
  QrcodeOutlined,
  LockOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import {
  Alert,
  App,
  Button,
  DatePicker,
  Empty,
  Image,
  Input,
  Popconfirm,
  Select,
  Table,
  Tag,
  Tooltip,
  Typography,
  type GetProps,
  type TableColumnsType,
} from "antd";
import { useEffect, useState } from "react";
import { akamaFields, type AkamaField } from "@/lib/akamaFields";
import { getErrorMessage } from "@/lib/api";
import type { AdminAkama } from "@/lib/types";
import AkamaFormModal from "./AkamaFormModal";
import AkamaViewModal from "./AkamaViewModal";
import { copyText, formatDate, PUBLIC_WARNING } from "./akamaUtils";
import {
  type AkamaFilters,
  useAkamaList,
  useAkamaStats,
  useDeleteAkama,
  useSetVisibility,
} from "./useAdmin";

/**
 * Admin dashboard (/admin) – everything for managing Akama records:
 *   - counters (total / public / private)
 *   - filter bar: search, visibility, created-date range, sort
 *   - records table with actions: View, QR, Edit, Make Public/Private,
 *     Copy Public Link, Delete
 *   - pop-ups: AkamaFormModal (add/edit) and AkamaViewModal (details + QR code)
 *
 * Data comes from the React Query hooks in useAdmin.ts; filtering, sorting and
 * paging are done by the server.
 */

// Value type of the antd date range picker
type RangeValue = GetProps<typeof DatePicker.RangePicker>["value"];

// Filters when the page opens and after "Clear filters"
const DEFAULT_FILTERS: AkamaFilters = { search: "", visibility: "all", sort: "newest", page: 1, limit: 10 };

// One counter box at the top of the dashboard
const StatCard = ({ label, value, tone }: { label: string; value?: number; tone: string }) => (
  <div className="rounded-2xl border border-line bg-white p-5">
    <p className="text-sm text-ink-soft">{label}</p>
    <p className={`mt-1 text-3xl font-semibold ${tone}`}>{value ?? "–"}</p>
  </div>
);

const AkamaDashboard = () => {
  const { message, modal } = App.useApp();
  const [filters, setFilters] = useState<AkamaFilters>(DEFAULT_FILTERS); // what the table query uses
  const [searchInput, setSearchInput] = useState(""); // text in the search box
  const [range, setRange] = useState<RangeValue>(null); // date picker value (for display)
  const [form, setForm] = useState<{ open: boolean; record?: AdminAkama }>({ open: false }); // add/edit pop-up
  const [viewing, setViewing] = useState<AdminAkama | null>(null); // details/QR pop-up

  // Server data and actions (see useAdmin.ts)

  const stats = useAkamaStats();
  const list = useAkamaList(filters);
  const setVisibility = useSetVisibility();
  const remove = useDeleteAkama();

  // Search as the admin types (short pause first)
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters(f => (f.search === searchInput ? f : { ...f, search: searchInput, page: 1 }));
    }, 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Is anything different from the defaults? (shows "Clear filters")
  const hasFilters =
    !!filters.search || filters.visibility !== "all" || !!filters.from || !!filters.to || filters.sort !== "newest";

  const clearFilters = () => {
    setSearchInput("");
    setRange(null);
    setFilters(DEFAULT_FILTERS);
  };

  // Make Public asks for confirmation first (privacy warning); Make Private runs immediately
  const changeVisibility = (record: AdminAkama, isPublic: boolean) => {
    const run = async () => {
      try {
        await setVisibility.mutateAsync({ id: record.id, isPublic });
        message.success(isPublic ? `${record.name} is now public` : `${record.name} is now private`);
      } catch (error) {
        message.error(getErrorMessage(error));
      }
    };
    if (!isPublic) return run();
    modal.confirm({
      title: "Make this record public?",
      content: PUBLIC_WARNING,
      okText: "Make Public",
      cancelText: "Cancel",
      onOk: run,
    });
  };

  // Copies the permanent public URL (the same one the QR code contains)
  const copyLink = async (record: AdminAkama) => {
    if (await copyText(record.publicUrl)) message.success("Public link copied");
    else message.error("Could not copy. Open the record and copy the link from there.");
  };

  // Called after the admin confirms the delete pop-up
  const deleteRecord = async (record: AdminAkama) => {
    try {
      await remove.mutateAsync(record.id);
      message.success("Akama record deleted");
      // Step back if the last row of a page was removed
      if (list.data?.items.length === 1 && filters.page > 1) setFilters(f => ({ ...f, page: f.page - 1 }));
    } catch (error) {
      message.error(getErrorMessage(error));
    }
  };

  // ---------- Table columns ----------

  // Certificate fields shown in the table (the rest are in the View pop-up)
  const fieldColumn = (key: AkamaField["key"], width: number): TableColumnsType<AdminAkama>[number] => {
    const field = akamaFields.find(f => f.key === key)!;
    return {
      // Arabic label (same as the public card) with the English meaning under it
      title: (
        <div className="leading-tight">
          <div dir="rtl">{field.label}</div>
          <div className="text-xs font-normal text-ink-soft">{field.hint}</div>
        </div>
      ),
      dataIndex: key,
      width,
      // dir="auto" keeps Arabic values right-to-left and numbers left-to-right
      render: (value: string) => (value ? <span dir="auto">{value}</span> : <span className="text-ink-soft">—</span>),
    };
  };

  const columns: TableColumnsType<AdminAkama> = [
    // Thumbnail – click to enlarge (antd Image preview)
    {
      title: "Image",
      dataIndex: "imageUrl",
      width: 96,
      render: (url: string, record) => (
        <Image
          src={url}
          alt={`Akama of ${record.name}`}
          width={72}
          height={52}
          style={{ objectFit: "cover", borderRadius: 8 }}
        />
      ),
    },
    {
      ...fieldColumn("name", 180),
      render: (name: string) => (
        <span dir="auto" className="font-medium">
          {name}
        </span>
      ),
    },
    fieldColumn("certificateNumber", 130),
    fieldColumn("identityNumber", 130),
    fieldColumn("nationality", 120),
    fieldColumn("profession", 170),
    fieldColumn("expiryDate", 120),
    fieldColumn("organizationName", 180),
    {
      title: "Akama ID",
      dataIndex: "id",
      width: 230,
      render: (id: string) => (
        <Typography.Text copyable={{ tooltips: ["Copy ID", "Copied"] }} className="font-mono !text-xs">
          {id}
        </Typography.Text>
      ),
    },
    {
      title: "Visibility",
      dataIndex: "isPublic",
      width: 110,
      render: (isPublic: boolean) =>
        isPublic ? (
          <Tag color="green" icon={<GlobalOutlined />}>
            Public
          </Tag>
        ) : (
          <Tag icon={<LockOutlined />}>Private</Tag>
        ),
    },
    { title: "Created", dataIndex: "createdAt", width: 170, render: formatDate },
    // Action buttons; Copy Public Link only appears for public records
    {
      title: "Actions",
      key: "actions",
      width: 380,
      render: (_, record) => (
        <div className="flex flex-wrap gap-1.5">
          <Button size="small" icon={<EyeOutlined />} onClick={() => setViewing(record)}>
            View
          </Button>
          <Tooltip title="QR code: download, print or copy link">
            <Button size="small" icon={<QrcodeOutlined />} onClick={() => setViewing(record)}>
              QR
            </Button>
          </Tooltip>
          <Button size="small" icon={<EditOutlined />} onClick={() => setForm({ open: true, record })}>
            Edit
          </Button>
          {record.isPublic ? (
            <Button size="small" icon={<LockOutlined />} onClick={() => changeVisibility(record, false)}>
              Make Private
            </Button>
          ) : (
            <Button size="small" icon={<GlobalOutlined />} onClick={() => changeVisibility(record, true)}>
              Make Public
            </Button>
          )}
          {record.isPublic && (
            <Tooltip title="Copy Public Link">
              <Button size="small" icon={<LinkOutlined />} onClick={() => copyLink(record)} aria-label="Copy Public Link" />
            </Tooltip>
          )}
          <Popconfirm
            title="Delete this record?"
            description="The record and its image will be removed permanently."
            okText="Delete Record"
            okButtonProps={{ danger: true }}
            cancelText="Cancel"
            onConfirm={() => deleteRecord(record)}
          >
            <Tooltip title="Delete Record">
              <Button size="small" danger icon={<DeleteOutlined />} aria-label="Delete Record" />
            </Tooltip>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page title + Add New Akama */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Dashboard</h1>
          <p className="text-sm text-ink-soft">Add, search and share Akama records.</p>
        </div>
        <Button type="primary" size="large" icon={<PlusOutlined />} onClick={() => setForm({ open: true })}>
          Add New Akama
        </Button>
      </div>

      {/* Counters */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total Akama records" value={stats.data?.total} tone="text-ink" />
        <StatCard label="Public" value={stats.data?.public} tone="text-brand-600" />
        <StatCard label="Private" value={stats.data?.private} tone="text-ink-soft" />
      </div>

      {/* Filter bar + table */}
      <section className="rounded-2xl border border-line bg-white">
        <div className="flex flex-col gap-3 border-b border-line p-4 lg:flex-row lg:flex-wrap lg:items-center">
          {/* Search by name or (part of) the ID – applied after a short typing pause */}
          <Input.Search
            allowClear
            value={searchInput}
            onChange={event => setSearchInput(event.target.value)}
            onSearch={value => setFilters(f => ({ ...f, search: value, page: 1 }))}
            placeholder="Search by name or Akama ID"
            className="lg:!w-72"
            maxLength={100}
          />
          <Select
            value={filters.visibility}
            onChange={visibility => setFilters(f => ({ ...f, visibility, page: 1 }))}
            className="lg:!w-40"
            options={[
              { value: "all", label: "All records" },
              { value: "public", label: "Public only" },
              { value: "private", label: "Private only" },
            ]}
          />
          <DatePicker.RangePicker
            value={range}
            placeholder={["Created from", "Created to"]}
            onChange={dates => {
              setRange(dates);
              // Whole days in the admin's local time: from 00:00 of the first day to 23:59 of the last
              setFilters(f => ({
                ...f,
                from: dates?.[0]?.startOf("day").toISOString(),
                to: dates?.[1]?.endOf("day").toISOString(),
                page: 1,
              }));
            }}
          />
          <Select
            value={filters.sort}
            onChange={sort => setFilters(f => ({ ...f, sort, page: 1 }))}
            className="lg:!w-40"
            options={[
              { value: "newest", label: "Newest first" },
              { value: "oldest", label: "Oldest first" },
            ]}
          />
          {hasFilters && (
            <Button type="link" onClick={clearFilters}>
              Clear filters
            </Button>
          )}
        </div>

        {/* Error loading -> message with retry; otherwise the table */}
        {list.isError ? (
          <div className="p-6">
            <Alert
              type="error"
              showIcon
              title="Could not load Akama records"
              description={getErrorMessage(list.error)}
              action={<Button onClick={() => list.refetch()}>Try again</Button>}
            />
          </div>
        ) : (
          <Table<AdminAkama>
            rowKey="id"
            columns={columns}
            dataSource={list.data?.items}
            loading={list.isFetching}
            scroll={{ x: 2200 }}
            locale={{
              emptyText: list.isLoading ? (
                " "
              ) : (
                <Empty
                  description={hasFilters ? "No records match your search or filters" : "No Akama records yet"}
                >
                  {hasFilters ? (
                    <Button onClick={clearFilters}>Clear filters</Button>
                  ) : (
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => setForm({ open: true })}>
                      Add New Akama
                    </Button>
                  )}
                </Empty>
              ),
            }}
            // Server-side paging: changing page/size updates the filters -> new request
            pagination={{
              current: filters.page,
              pageSize: filters.limit,
              total: list.data?.meta.total ?? 0,
              showSizeChanger: true,
              pageSizeOptions: [10, 20, 50],
              showTotal: total => `${total} record${total === 1 ? "" : "s"}`,
              onChange: (page, limit) =>
                setFilters(f => ({ ...f, page: limit !== f.limit ? 1 : page, limit })),
            }}
          />
        )}
      </section>

      {/* Pop-ups */}
      {form.open && (
        <AkamaFormModal
          open
          record={form.record}
          onClose={() => setForm({ open: false })}
          // Show the new record's details and QR code straight after creating it
          onCreated={record => setViewing(record)}
        />
      )}
      <AkamaViewModal
        record={viewing}
        onClose={() => setViewing(null)}
        onEdit={record => {
          setViewing(null);
          setForm({ open: true, record });
        }}
      />
    </div>
  );
};

export default AkamaDashboard;
