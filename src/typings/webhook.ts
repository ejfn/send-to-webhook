export interface WebHook {
  name: string;
  documentUrlPatterns?: string[];
  targetUrlPatterns?: string[];
  action: WebHookAction;
}

export interface WebHookAction {
  method?: 'GET' | 'POST';
  url: string;
  payload?: any;
  headers?: {};
}
