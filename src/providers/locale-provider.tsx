"use client";

import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type Locale = "vi" | "en";

const messages = {
  vi: {
    actions: "Thao tác",
    cancel: "Hủy",
    create: "Tạo",
    update: "Cập nhật",
    edit: "Chỉnh sửa",
    delete: "Xóa",
    new: "Thêm",
    search: "Tìm",
    select: "Chọn...",
    none: "Không có",
    yes: "Có",
    no: "Không",
    active: "Đang hoạt động",
    inactive: "Không hoạt động",
    confirmDelete: "Bạn có chắc muốn xóa",
    autoSchemas: "Schema tự động",
    quickCreate: "Tạo nhanh",
    inbox: "Hộp thư",
    settings: "Cài đặt",
    getHelp: "Trợ giúp",
    searchLabel: "Tìm kiếm",
  },
  en: {
    actions: "Actions",
    cancel: "Cancel",
    create: "Create",
    update: "Update",
    edit: "Edit",
    delete: "Delete",
    new: "New",
    search: "Search",
    select: "Select...",
    none: "None",
    yes: "Yes",
    no: "No",
    active: "Active",
    inactive: "Inactive",
    confirmDelete: "Are you sure you want to delete",
    autoSchemas: "Auto Schemas",
    quickCreate: "Quick Create",
    inbox: "Inbox",
    settings: "Settings",
    getHelp: "Get Help",
    searchLabel: "Search",
  },
} as const;

type MessageKey = keyof typeof messages.en;

const LocaleContext = createContext<{
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: MessageKey) => string;
}>({
  locale: "vi",
  setLocale: () => undefined,
  t: (key) => messages.vi[key],
});

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("vi");
  useEffect(() => {
    const saved = window.localStorage.getItem("dashboard-locale");
    if (saved === "vi" || saved === "en") setLocaleState(saved);
  }, []);
  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    window.localStorage.setItem("dashboard-locale", next);
  }, []);
  const value = useMemo(
    () => ({ locale, setLocale, t: (key: MessageKey) => messages[locale][key] }),
    [locale, setLocale],
  );
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  return useContext(LocaleContext);
}

export function translateLabel(value: string, locale: Locale) {
  const key = value
    .toLowerCase()
    .replace(/[^a-z]+/g, "")
    .replace(/^new/, "new");
  const known: Record<string, string> = {
    dashboards: "Bảng điều khiển",
    dashboard: "Bảng điều khiển",
    content: "Nội dung",
    rewards: "Phần thưởng",
    system: "Hệ thống",
    pages: "Trang",
    legacy: "Cũ",
    default: "Mặc định",
    posts: "Bài viết",
    categories: "Danh mục",
    tags: "Thẻ",
    authors: "Tác giả",
    banners: "Banner",
    blocks: "Khối",
    menus: "Menu",
    users: "Người dùng",
    roles: "Vai trò",
    domains: "Tên miền",
    files: "Tệp",
    sessions: "Phiên",
    contacts: "Liên hệ",
    email: "Email",
    chat: "Trò chuyện",
    calendar: "Lịch",
    authentication: "Xác thực",
    login: "Đăng nhập",
    register: "Đăng ký",
    others: "Khác",
    rewardtiers: "Bậc thưởng",
    rewardprizes: "Giải thưởng",
    rewardtasks: "Nhiệm vụ thưởng",
    rewardconfigreleases: "Bản phát hành cấu hình thưởng",
  };
  return locale === "vi" ? (known[key] ?? value) : value;
}
