"use client";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { App, ConfigProvider } from "antd";
import { useState } from "react";

/**
 * Wraps all /admin pages (see app/admin/layout.tsx):
 *   AntdRegistry      – makes Ant Design styles work with server rendering
 *   ConfigProvider    – Ant Design theme in the site's green colours
 *   App               – enables message/modal pop-ups via App.useApp()
 *   QueryClientProvider – React Query cache used by useAdmin.ts
 * Kept out of the public pages so visitors don't download Ant Design.
 */
const AdminProviders = ({ children }: { children: React.ReactNode }) => {
  // One query cache per browser tab. staleTime 0 = always fetch fresh admin data.
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { refetchOnWindowFocus: false, retry: 1, staleTime: 0 },
        },
      }),
  );

  return (
    <AntdRegistry>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: "#006c35",
            colorLink: "#006c35",
            colorText: "#1d2420",
            borderRadius: 10,
            fontFamily: "inherit",
            fontSize: 15,
          },
          components: {
            Table: { headerBg: "#f3f6f1" },
          },
        }}
      >
        <App>
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        </App>
      </ConfigProvider>
    </AntdRegistry>
  );
};

export default AdminProviders;
