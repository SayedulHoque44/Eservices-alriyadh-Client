"use client";
import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
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
  Tooltip,
  Typography,
  type GetProps,
  type TableColumnsType,
} from "antd";
import { useEffect, useState } from "react";
import { getErrorMessage } from "@/lib/api";
import type { AdminAbsher } from "@/lib/types";
import { cdnImageUrl } from "@/lib/uploadImage";
import AbsherFormModal from "./AbsherFormModal";
import AbsherViewModal from "./AbsherViewModal";
import { formatDate } from "./akamaUtils";
import {
  type AbsherFilters,
  useAbsherList,
  useAbsherStats,
  useDeleteAbsher,
} from "./useAdmin";

/**
 * Absher dashboard (/admin/absher) – managing the accounts the mobile app logs into:
 *   - counter (total accounts)
 *   - filter bar: search, created-date range, sort
 *   - accounts table with actions: View, Edit, Delete
 *   - pop-ups: AbsherFormModal (add/edit) and AbsherViewModal (details)
 *
 * Same layout as AkamaDashboard, without visibility, public links or QR codes.
 * Data comes from the React Query hooks in useAdmin.ts; filtering, sorting and
 * paging are done by the server.
 */

// Value type of the antd date range picker
type RangeValue = GetProps<typeof DatePicker.RangePicker>["value"];

// Filters when the page opens and after "Clear filters"
const DEFAULT_FILTERS: AbsherFilters = {
  search: "",
  sort: "newest",
  page: 1,
  limit: 10,
};

// Shows "—" for empty values; dir="auto" keeps Arabic right-to-left
const text = (value: string) =>
  value ? (
    <span dir="auto">{value}</span>
  ) : (
    <span className="text-ink-soft">—</span>
  );

// Value with a copy button (IDs and the PIN)
const copyable = (value: string) =>
  value ? (
    <Typography.Text
      copyable={{ tooltips: ["Copy", "Copied"] }}
      className="font-mono !text-xs"
    >
      {value}
    </Typography.Text>
  ) : (
    <span className="text-ink-soft">—</span>
  );

const AbsherDashboard = () => {
  const { message } = App.useApp();
  const [filters, setFilters] = useState<AbsherFilters>(DEFAULT_FILTERS); // what the table query uses
  const [searchInput, setSearchInput] = useState(""); // text in the search box
  const [range, setRange] = useState<RangeValue>(null); // date picker value (for display)
  const [form, setForm] = useState<{ open: boolean; record?: AdminAbsher }>({
    open: false,
  }); // add/edit pop-up
  const [viewing, setViewing] = useState<AdminAbsher | null>(null); // details pop-up

  // Server data and actions (see useAdmin.ts)
  const stats = useAbsherStats();
  const list = useAbsherList(filters);
  const remove = useDeleteAbsher();

  // Search as the admin types (short pause first)
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((f) =>
        f.search === searchInput ? f : { ...f, search: searchInput, page: 1 },
      );
    }, 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Is anything different from the defaults? (shows "Clear filters")
  const hasFilters =
    !!filters.search ||
    !!filters.from ||
    !!filters.to ||
    filters.sort !== "newest";

  const clearFilters = () => {
    setSearchInput("");
    setRange(null);
    setFilters(DEFAULT_FILTERS);
  };

  // Called after the admin confirms the delete pop-up
  const deleteRecord = async (record: AdminAbsher) => {
    try {
      await remove.mutateAsync(record.id);
      message.success("Absher account deleted");
      // Step back if the last row of a page was removed
      if (list.data?.items.length === 1 && filters.page > 1)
        setFilters((f) => ({ ...f, page: f.page - 1 }));
    } catch (error) {
      message.error(getErrorMessage(error));
    }
  };

  // ---------- Table columns (the rest of the details are in the View pop-up) ----------
  const columns: TableColumnsType<AdminAbsher> = [
    // Profile photo from the CDN – click to enlarge (antd Image preview)
    {
      title: "Photo",
      dataIndex: "photoKey",
      width: 80,
      render: (key: string, record) =>
        !key ? (
          <span className="text-ink-soft">—</span>
        ) : (
          <Image
            src={cdnImageUrl(key)}
            alt={`Photo of ${record.name}`}
            width={48}
            height={56}
            style={{ objectFit: "cover", borderRadius: 8 }}
          />
        ),
    },
    {
      title: "Name",
      dataIndex: "name",
      width: 200,
      render: (name: string) => (
        <span dir="auto" className="font-medium">
          {name}
        </span>
      ),
    },
    {
      title: "Resident ID (login)",
      dataIndex: "residentId",
      width: 170,
      render: copyable,
    },
    { title: "PIN", dataIndex: "pin", width: 100, render: copyable },
    {
      title: "Nationality",
      dataIndex: "nationality",
      width: 130,
      render: text,
    },
    {
      title: "Passport Number",
      dataIndex: "passportNumber",
      width: 150,
      render: copyable,
    },
    {
      title: "Sponsor Name",
      dataIndex: "sponsorName",
      width: 200,
      render: text,
    },
    { title: "ID Expiry", dataIndex: "idExpiryDate", width: 120, render: text },
    {
      title: "Created",
      dataIndex: "createdAt",
      width: 170,
      render: formatDate,
    },
    {
      title: "Actions",
      key: "actions",
      width: 200,
      render: (_, record) => (
        <div className="flex flex-wrap gap-1.5">
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => setViewing(record)}
          >
            View
          </Button>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => setForm({ open: true, record })}
          >
            Edit
          </Button>
          <Popconfirm
            title="Delete this Absher account?"
            description="The account and its images will be removed permanently. The person can no longer log in to the app."
            okText="Delete Account"
            okButtonProps={{ danger: true }}
            cancelText="Cancel"
            onConfirm={() => deleteRecord(record)}
          >
            <Tooltip title="Delete Account">
              <Button
                size="small"
                danger
                icon={<DeleteOutlined />}
                aria-label="Delete Account"
              />
            </Tooltip>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page title + Add New Absher */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Absher</h1>
          <p className="text-sm text-ink-soft">
            Add and edit the accounts people use to log in to the app.
          </p>
        </div>
        <Button
          type="primary"
          size="large"
          icon={<PlusOutlined />}
          onClick={() => setForm({ open: true })}
        >
          Add New Absher
        </Button>
      </div>

      {/* Counter */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-line bg-white p-5">
          <p className="text-sm text-ink-soft">Total Absher accounts</p>
          <p className="mt-1 text-3xl font-semibold text-ink">
            {stats.data?.total ?? "–"}
          </p>
        </div>
      </div>

      {/* Filter bar + table */}
      <section className="rounded-2xl border border-line bg-white">
        <div className="flex flex-col gap-3 border-b border-line p-4 lg:flex-row lg:flex-wrap lg:items-center">
          {/* Search by name, resident ID, passport or sponsor ID – applied after a short typing pause */}
          <Input.Search
            allowClear
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            onSearch={(value) =>
              setFilters((f) => ({ ...f, search: value, page: 1 }))
            }
            placeholder="Search by name, ID or passport"
            className="lg:!w-72"
            maxLength={100}
          />
          <DatePicker.RangePicker
            value={range}
            placeholder={["Created from", "Created to"]}
            onChange={(dates) => {
              setRange(dates);
              // Whole days in the admin's local time: from 00:00 of the first day to 23:59 of the last
              setFilters((f) => ({
                ...f,
                from: dates?.[0]?.startOf("day").toISOString(),
                to: dates?.[1]?.endOf("day").toISOString(),
                page: 1,
              }));
            }}
          />
          <Select
            value={filters.sort}
            onChange={(sort) => setFilters((f) => ({ ...f, sort, page: 1 }))}
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
              title="Could not load Absher accounts"
              description={getErrorMessage(list.error)}
              action={<Button onClick={() => list.refetch()}>Try again</Button>}
            />
          </div>
        ) : (
          <Table<AdminAbsher>
            rowKey="id"
            columns={columns}
            dataSource={list.data?.items}
            loading={list.isFetching}
            scroll={{ x: 1500 }}
            locale={{
              emptyText: list.isLoading ? (
                " "
              ) : (
                <Empty
                  description={
                    hasFilters
                      ? "No accounts match your search or filters"
                      : "No Absher accounts yet"
                  }
                >
                  {hasFilters ? (
                    <Button onClick={clearFilters}>Clear filters</Button>
                  ) : (
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={() => setForm({ open: true })}
                    >
                      Add New Absher
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
              showTotal: (total) => `${total} account${total === 1 ? "" : "s"}`,
              onChange: (page, limit) =>
                setFilters((f) => ({
                  ...f,
                  page: limit !== f.limit ? 1 : page,
                  limit,
                })),
            }}
          />
        )}
      </section>

      {/* Pop-ups */}
      {form.open && (
        <AbsherFormModal
          open
          record={form.record}
          onClose={() => setForm({ open: false })}
          // Show the new account's details straight after creating it
          onCreated={(record) => setViewing(record)}
        />
      )}
      <AbsherViewModal
        record={viewing}
        onClose={() => setViewing(null)}
        onEdit={(record) => {
          setViewing(null);
          setForm({ open: true, record });
        }}
      />
    </div>
  );
};

export default AbsherDashboard;
