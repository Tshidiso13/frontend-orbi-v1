// frontend/lib/api.ts

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:5000/api";

const ACCESS_TOKEN_KEY =
  "accessToken";

const USER_KEY =
  "user";

/* =========================================================
   SHARED TYPES
========================================================= */

type ApiErrorResponse = {
  message?: string | string[];
  error?: string;
  statusCode?: number;
};

type RequestOptions =
  RequestInit & {
    auth?: boolean;
  };

export type AdminUserRole =
  | "USER"
  | "BUSINESS"
  | "ADMIN";

export type AuthUser = {
  id: string;
  name: string;

  username?:
    | string
    | null;

  email: string;

  image?:
    | string
    | null;

  role:
    AdminUserRole;

  createdAt?: string;
  updatedAt?: string;
};

export type AuthResponse = {
  message: string;
  user: AuthUser;
  accessToken: string;
};

export type RegisterPayload = {
  name: string;
  email: string;
  password: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type UpdateProfileResponse = {
  message: string;
  user: AuthUser;
};

/* =========================================================
   SETTINGS TYPES
========================================================= */

export type ThemeMode =
  | "system"
  | "light"
  | "dark";

export type AccentColor =
  | "zinc"
  | "blue"
  | "green"
  | "purple"
  | "orange";

export type UserSettingsResponse = {
  account: {
    id: string;
    name: string;

    username:
      | string
      | null;

    email: string;

    image:
      | string
      | null;

    role: string;

    createdAt?: string;
  };

  appearance: {
    theme: ThemeMode;

    accentColor:
      AccentColor;

    language: string;
  };
};

/* =========================================================
   SEARCH TYPES
========================================================= */

export type SearchHistoryItem = {
  id: string;

  query: string;

  service: string;

  problem:
    | string
    | null;

  location:
    | string
    | null;

  date:
    | string
    | null;

  urgency: string;

  latitude:
    | number
    | null;

  longitude:
    | number
    | null;

  resultCount: number;

  createdAt: string;
};

export type ParsedSearchRequest = {
  service: string;

  problem:
    | string
    | null;

  location:
    | string
    | null;

  date:
    | string
    | null;

  urgency:
    | "low"
    | "normal"
    | "high"
    | "emergency";
};

export type BusinessSearchResult = {
  id: string;

  name: string;

  description?:
    | string
    | null;

  category: string;

  services: string[];

  phone?:
    | string
    | null;

  whatsapp?:
    | string
    | null;

  website?:
    | string
    | null;

  mapUrl?:
    | string
    | null;

  openingHours?:
    | string
    | null;

  address?:
    | string
    | null;

  city: string;

  latitude?:
    | number
    | null;

  longitude?:
    | number
    | null;

  rating:
    | number
    | null;

  reviewCount:
    | number
    | null;

  verified: boolean;

  distance:
    | number
    | null;

  score: number;

  source?:
    | "geoapify";
};

export type SearchResponse = {
  query: string;

  request:
    ParsedSearchRequest;

  totalResults: number;

  results:
    BusinessSearchResult[];
};

/* =========================================================
   SAVED PROVIDERS TYPES
========================================================= */

export type SavedProvider = {
  id: string;

  externalProviderId:
    string;

  source: string;

  name: string;

  description?:
    | string
    | null;

  category?:
    | string
    | null;

  services: string[];

  phone?:
    | string
    | null;

  whatsapp?:
    | string
    | null;

  website?:
    | string
    | null;

  mapUrl?:
    | string
    | null;

  address?:
    | string
    | null;

  city?:
    | string
    | null;

  latitude?:
    | number
    | null;

  longitude?:
    | number
    | null;

  rating?:
    | number
    | null;

  reviewCount?:
    | number
    | null;

  verified: boolean;

  createdAt: string;
  updatedAt: string;
};

/* =========================================================
   SUPPORT TYPES
========================================================= */

export type ContactSupportPayload = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

export type SupportTicketStatus =
  | "OPEN"
  | "IN_PROGRESS"
  | "RESOLVED"
  | "CLOSED";

export type SupportTicket = {
  id: string;

  name: string;

  email: string;

  subject: string;

  message: string;

  status:
    SupportTicketStatus;

  createdAt: string;

  updatedAt: string;
};

/* =========================================================
   ADMIN TYPES
========================================================= */

export type AdminUserRoleUpdateResponse = {
  id: string;

  name: string;

  username:
    | string
    | null;

  email: string;

  role:
    AdminUserRole;
};

export type AdminUserRecord = {
  id: string;

  name: string;

  username:
    | string
    | null;

  email: string;

  image:
    | string
    | null;

  role:
    AdminUserRole;

  createdAt: string;

  updatedAt: string;

  _count: {
    searchHistory:
      number;

    savedProviders:
      number;
  };
};

export type AdminPagination = {
  page: number;
  limit: number;
  total: number;
  pages: number;
};

export type AdminUsersResponse = {
  users:
    AdminUserRecord[];

  pagination:
    AdminPagination;
};

export type AdminDashboardResponse = {
  stats: {
    totalUsers: number;
    usersToday: number;

    totalSearches:
      number;

    searchesToday:
      number;

    totalSavedProviders:
      number;

    openSupportTickets:
      number;
  };

  topServices: {
    service: string;
    searches: number;
  }[];

  searchActivity: {
    date: string;
    searches: number;
  }[];

  recentUsers: {
    id: string;
    name: string;

    username:
      | string
      | null;

    email: string;

    image:
      | string
      | null;

    role:
      AdminUserRole;

    createdAt: string;
  }[];

  recentSearches: {
    id: string;

    query: string;

    service: string;

    problem:
      | string
      | null;

    location:
      | string
      | null;

    urgency: string;

    resultCount:
      number;

    createdAt: string;

    user: {
      id: string;
      name: string;
      email: string;
    };
  }[];
};

export type AdminSearchHistoryItem =
  SearchHistoryItem & {
    user: {
      id: string;
      name: string;
      email: string;
    };
  };

export type AdminSearchesResponse = {
  searches:
    AdminSearchHistoryItem[];

  pagination:
    AdminPagination;
};

export type AdminSavedProvider =
  SavedProvider & {
    user: {
      id: string;
      name: string;
      email: string;
    };
  };

export type AdminSavedProvidersResponse = {
  providers:
    AdminSavedProvider[];

  pagination:
    AdminPagination;
};

export type AdminSystemResponse = {
  status:
    | "operational"
    | "degraded";

  database: {
    online: boolean;

    latencyMs:
      | number
      | null;

    error:
      | string
      | null;
  };

  services: {
    ollama: {
      provider: string;

      configured:
        boolean;

      online:
        boolean;

      baseUrl:
        string;

      targetModel:
        string;

      modelAvailable:
        boolean;

      models:
        string[];

      latencyMs:
        | number
        | null;

      error:
        | string
        | null;
    };

    geoapify: {
      provider: string;

      configured:
        boolean;

      online:
        boolean;

      responseValid?:
        boolean;

      latencyMs:
        | number
        | null;

      error:
        | string
        | null;
    };

    email: {
      provider: string;

      configured:
        boolean;

      online:
        boolean;

      latencyMs:
        | number
        | null;

      error:
        | string
        | null;
    };
  };

  environment:
    string;

  live:
    boolean;

  version:
    string;

  checkedAt:
    string;
};

export type AdminMeResponse = {
  admin: boolean;

  user: {
    id: string;
    email: string;
    role:
      AdminUserRole;
  };
};

/* =========================================================
   TOKEN / LOCAL AUTH
========================================================= */

export function getAccessToken() {
  if (
    typeof window ===
    "undefined"
  ) {
    return null;
  }

  return localStorage.getItem(
    ACCESS_TOKEN_KEY
  );
}

export function getStoredUser():
  AuthUser | null {
  if (
    typeof window ===
    "undefined"
  ) {
    return null;
  }

  const stored =
    localStorage.getItem(
      USER_KEY
    );

  if (!stored) {
    return null;
  }

  try {
    const parsed =
      JSON.parse(
        stored
      ) as unknown;

    if (
      !parsed ||
      typeof parsed !==
        "object"
    ) {
      return null;
    }

    const user =
      parsed as Partial<AuthUser>;

    if (
      typeof user.id !==
        "string" ||
      typeof user.name !==
        "string" ||
      typeof user.email !==
        "string" ||
      !isUserRole(
        user.role
      )
    ) {
      return null;
    }

    return user as AuthUser;
  } catch {
    return null;
  }
}

export function setStoredUser(
  user: AuthUser
) {
  if (
    typeof window ===
    "undefined"
  ) {
    return;
  }

  localStorage.setItem(
    USER_KEY,
    JSON.stringify(
      user
    )
  );

  window.dispatchEvent(
    new Event(
      "auth-updated"
    )
  );
}

export function saveAuth(
  accessToken: string,
  user: AuthUser
) {
  if (
    typeof window ===
    "undefined"
  ) {
    return;
  }

  localStorage.setItem(
    ACCESS_TOKEN_KEY,
    accessToken
  );

  localStorage.setItem(
    USER_KEY,
    JSON.stringify(
      user
    )
  );

  /*
   * Important:
   * Sidebar/settings provider can
   * react immediately after login.
   */
  window.dispatchEvent(
    new Event(
      "auth-updated"
    )
  );
}

export function clearAuth() {
  if (
    typeof window ===
    "undefined"
  ) {
    return;
  }

  localStorage.removeItem(
    ACCESS_TOKEN_KEY
  );

  localStorage.removeItem(
    USER_KEY
  );

  window.dispatchEvent(
    new Event(
      "auth-updated"
    )
  );
}

export function logoutUser() {
  clearAuth();
}

function isUserRole(
  value: unknown
): value is AdminUserRole {
  return (
    value === "USER" ||
    value === "BUSINESS" ||
    value === "ADMIN"
  );
}

/* =========================================================
   MAIN API REQUEST
========================================================= */

async function apiRequest<T>(
  endpoint: string,
  options:
    RequestOptions = {}
): Promise<T> {
  const {
    auth = false,
    headers,
    ...requestOptions
  } = options;

  const requestHeaders =
    new Headers(
      headers
    );

  if (
    requestOptions.body &&
    !(
      requestOptions.body instanceof
      FormData
    )
  ) {
    requestHeaders.set(
      "Content-Type",
      "application/json"
    );
  }

  if (auth) {
    const token =
      getAccessToken();

    if (token) {
      requestHeaders.set(
        "Authorization",
        `Bearer ${token}`
      );
    }
  }

  const response =
    await fetch(
      `${API_URL}${endpoint}`,
      {
        ...requestOptions,

        headers:
          requestHeaders,
      }
    );

  let data:
    unknown = null;

  try {
    data =
      await response.json();
  } catch {
    data =
      null;
  }

  if (
    !response.ok
  ) {
    const errorData =
      (
        data ?? {}
      ) as ApiErrorResponse;

    let message =
      "Something went wrong.";

    if (
      Array.isArray(
        errorData.message
      )
    ) {
      message =
        errorData.message[0] ??
        message;
    } else if (
      typeof errorData.message ===
      "string"
    ) {
      message =
        errorData.message;
    } else if (
      typeof errorData.error ===
      "string"
    ) {
      message =
        errorData.error;
    }

    throw new Error(
      message
    );
  }

  return data as T;
}

/* =========================================================
   GENERIC API HELPERS
========================================================= */

export const api = {
  get: <T>(
    endpoint: string,
    auth = false
  ) =>
    apiRequest<T>(
      endpoint,
      {
        method:
          "GET",

        auth,
      }
    ),

  post: <T>(
    endpoint: string,
    body?: unknown,
    auth = false
  ) =>
    apiRequest<T>(
      endpoint,
      {
        method:
          "POST",

        auth,

        body:
          body !==
          undefined
            ? JSON.stringify(
                body
              )
            : undefined,
      }
    ),

  put: <T>(
    endpoint: string,
    body?: unknown,
    auth = false
  ) =>
    apiRequest<T>(
      endpoint,
      {
        method:
          "PUT",

        auth,

        body:
          body !==
          undefined
            ? JSON.stringify(
                body
              )
            : undefined,
      }
    ),

  patch: <T>(
    endpoint: string,
    body?: unknown,
    auth = false
  ) =>
    apiRequest<T>(
      endpoint,
      {
        method:
          "PATCH",

        auth,

        body:
          body !==
          undefined
            ? JSON.stringify(
                body
              )
            : undefined,
      }
    ),

  delete: <T>(
    endpoint: string,
    auth = false,
    body?: unknown
  ) =>
    apiRequest<T>(
      endpoint,
      {
        method:
          "DELETE",

        auth,

        body:
          body !==
          undefined
            ? JSON.stringify(
                body
              )
            : undefined,
      }
    ),
};

/* =========================================================
   AUTH
========================================================= */

export async function registerUser(
  payload:
    RegisterPayload
) {
  const data =
    await apiRequest<AuthResponse>(
      "/auth/register",
      {
        method:
          "POST",

        body:
          JSON.stringify(
            payload
          ),
      }
    );

  saveAuth(
    data.accessToken,
    data.user
  );

  return data;
}

export async function loginUser(
  payload:
    LoginPayload
) {
  const data =
    await apiRequest<AuthResponse>(
      "/auth/login",
      {
        method:
          "POST",

        body:
          JSON.stringify(
            payload
          ),
      }
    );

  saveAuth(
    data.accessToken,
    data.user
  );

  return data;
}

export async function getCurrentUser() {
  return api.get<
    AuthUser
  >(
    "/auth/me",
    true
  );
}

/* =========================================================
   PASSWORD RESET
========================================================= */

export async function forgotPassword(
  email: string
) {
  return api.post<{
    message: string;
  }>(
    "/auth/forgot-password",
    {
      email,
    }
  );
}

export async function resetPassword(
  payload: {
    token: string;
    newPassword: string;
  }
) {
  return api.post<{
    message: string;
  }>(
    "/auth/reset-password",
    payload
  );
}

/* =========================================================
   PROFILE
========================================================= */

export async function updateProfile(
  formData:
    FormData
) {
  const data =
    await apiRequest<
      UpdateProfileResponse
    >(
      "/users/profile",
      {
        method:
          "PATCH",

        auth:
          true,

        body:
          formData,
      }
    );

  setStoredUser(
    data.user
  );

  return data;
}

/* =========================================================
   SETTINGS
========================================================= */

export async function getSettings() {
  return api.get<
    UserSettingsResponse
  >(
    "/settings",
    true
  );
}

export async function updateAppearance(
  payload: {
    theme?:
      ThemeMode;

    accentColor?:
      AccentColor;

    language?:
      string;
  }
) {
  return api.patch<{
    message: string;

    appearance:
      UserSettingsResponse["appearance"];
  }>(
    "/settings/appearance",
    payload,
    true
  );
}

export async function updateAccountSettings(
  payload: {
    name?: string;

    username?:
      string | null;

    email?: string;
  }
) {
  return api.patch<{
    message: string;

    account:
      UserSettingsResponse["account"];
  }>(
    "/settings/account",
    payload,
    true
  );
}

export async function changePassword(
  payload: {
    currentPassword:
      string;

    newPassword:
      string;
  }
) {
  return api.patch<{
    message: string;

    requiresReauthentication:
      boolean;
  }>(
    "/settings/security/password",
    payload,
    true
  );
}

export async function logoutAllDevices() {
  return api.post<{
    message: string;
  }>(
    "/settings/security/logout-all",
    {},
    true
  );
}

export async function deleteAccount(
  password: string
) {
  return api.delete<{
    message: string;
  }>(
    "/settings/account",
    true,
    {
      password,
    }
  );
}

/* =========================================================
   SEARCH
========================================================= */

export async function searchBusinesses(
  payload: {
    query: string;

    latitude?: number;

    longitude?: number;

    recordHistory?:
      boolean;
  }
) {
  return api.post<
    SearchResponse
  >(
    "/search",
    payload,
    true
  );
}

export async function getSearchHistory() {
  return api.get<
    SearchHistoryItem[]
  >(
    "/search/history",
    true
  );
}

export async function deleteSearchHistory(
  id: string
) {
  return api.delete<{
    message: string;
  }>(
    `/search/history/${encodeURIComponent(
      id
    )}`,
    true
  );
}

export async function clearSearchHistory() {
  return api.delete<{
    message: string;
  }>(
    "/search/history",
    true
  );
}

/* =========================================================
   SAVED PROVIDERS
========================================================= */

export async function getSavedProviders() {
  return api.get<
    SavedProvider[]
  >(
    "/saved",
    true
  );
}

export async function saveProvider(
  business:
    BusinessSearchResult
) {
  return api.post<{
    message: string;

    provider:
      SavedProvider;
  }>(
    "/saved",
    {
      externalProviderId:
        business.id,

      source:
        business.source ??
        "geoapify",

      name:
        business.name,

      description:
        business.description ??
        null,

      category:
        business.category,

      services:
        business.services ??
        [],

      phone:
        business.phone ??
        null,

      whatsapp:
        business.whatsapp ??
        null,

      website:
        business.website ??
        null,

      mapUrl:
        business.mapUrl ??
        null,

      address:
        business.address ??
        null,

      city:
        business.city ??
        null,

      latitude:
        business.latitude ??
        null,

      longitude:
        business.longitude ??
        null,

      rating:
        business.rating ??
        null,

      reviewCount:
        business.reviewCount ??
        null,

      verified:
        business.verified ??
        false,
    },
    true
  );
}

export async function removeSavedProvider(
  providerId:
    string,
  source =
    "geoapify"
) {
  return api.delete<{
    message: string;
  }>(
    `/saved/${encodeURIComponent(
      providerId
    )}?source=${encodeURIComponent(
      source
    )}`,
    true
  );
}

export async function clearSavedProviders() {
  return api.delete<{
    message: string;
  }>(
    "/saved",
    true
  );
}

/* =========================================================
   SUPPORT
========================================================= */

export async function contactSupport(
  payload:
    ContactSupportPayload
) {
  return api.post<{
    message: string;

    ticketId?:
      string;
  }>(
    "/support/contact",
    payload
  );
}

/* =========================================================
   ADMIN - AUTH
========================================================= */

export function getAdminMe() {
  return api.get<
    AdminMeResponse
  >(
    "/admin/me",
    true
  );
}

/* =========================================================
   ADMIN - DASHBOARD
========================================================= */

export function getAdminDashboard() {
  return api.get<
    AdminDashboardResponse
  >(
    "/admin/dashboard",
    true
  );
}

/* =========================================================
   ADMIN - USERS
========================================================= */

export function getAdminUsers(
  {
    page = 1,
    limit = 20,
    search = "",
  }: {
    page?: number;
    limit?: number;
    search?: string;
  } = {}
) {
  const params =
    new URLSearchParams({
      page:
        String(page),

      limit:
        String(limit),
    });

  if (
    search.trim()
  ) {
    params.set(
      "search",
      search.trim()
    );
  }

  return api.get<
    AdminUsersResponse
  >(
    `/admin/users?${params.toString()}`,
    true
  );
}

export function updateAdminUserRole(
  userId: string,
  role:
    AdminUserRole
) {
  return api.patch<
    AdminUserRoleUpdateResponse
  >(
    `/admin/users/${encodeURIComponent(
      userId
    )}/role`,
    {
      role,
    },
    true
  );
}

/* =========================================================
   ADMIN - SEARCHES
========================================================= */

export function getAdminSearches(
  page = 1,
  limit = 30
) {
  const params =
    new URLSearchParams({
      page:
        String(page),

      limit:
        String(limit),
    });

  return api.get<
    AdminSearchesResponse
  >(
    `/admin/searches?${params.toString()}`,
    true
  );
}

/* =========================================================
   ADMIN - SAVED PROVIDERS
========================================================= */

export function getAdminSavedProviders(
  page = 1,
  limit = 30
) {
  const params =
    new URLSearchParams({
      page:
        String(page),

      limit:
        String(limit),
    });

  return api.get<
    AdminSavedProvidersResponse
  >(
    `/admin/saved?${params.toString()}`,
    true
  );
}

/* =========================================================
   ADMIN - SUPPORT
========================================================= */

export function getAdminSupportTickets(
  status?:
    SupportTicketStatus
) {
  const query =
    status
      ? `?status=${encodeURIComponent(
          status
        )}`
      : "";

  return api.get<
    SupportTicket[]
  >(
    `/admin/support${query}`,
    true
  );
}

export function updateSupportTicketStatus(
  id: string,
  status:
    SupportTicketStatus
) {
  return api.patch<
    SupportTicket
  >(
    `/admin/support/${encodeURIComponent(
      id
    )}/status`,
    {
      status,
    },
    true
  );
}

/* =========================================================
   ADMIN - SYSTEM
========================================================= */

export function getAdminSystem() {
  return api.get<
    AdminSystemResponse
  >(
    "/admin/system",
    true
  );
}