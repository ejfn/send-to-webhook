interface StoredData {
  webhooks: string;
}

interface WebHook {
  name: string;
  documentUrlPatterns?: string[];
  targetUrlPatterns?: string[];
  action: WebHookAction;
}

interface WebHookAction {
  method?: 'GET' | 'POST';
  url: string;
  payload?: any;
  headers?: { [key: string]: string }; // Added index signature
}