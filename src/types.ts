interface Webhook {
  name: string;
  documentUrlPatterns?: string[];
  targetUrlPatterns?: string[];
  action: WebhookAction;
}

interface WebhookAction {
  method: 'GET' | 'POST';
  url: string;
  payload?: any;
}
