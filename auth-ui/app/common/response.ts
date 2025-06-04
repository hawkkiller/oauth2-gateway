export type BackendResponse<T> = {
  ok: boolean;
  data: T;
  error: string | null;
};

export type BackendError = {
  code: string;
  message: string;
  details: any;
};
