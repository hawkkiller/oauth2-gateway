export type BackendResponse<T> = {
  ok: boolean;
  data: T;
  error: BackendError | null;
};

export type BackendError = {
  code: string;
  message: string;
  details: any;
};
