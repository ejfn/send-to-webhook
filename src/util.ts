interface Webhook {
  name: string;
  documentUrlPatterns?: string[];
  targetUrlPatterns?: string[];
  action: WebhookAction;
}

interface WebhookAction {
  method?: 'GET' | 'POST';
  url: string;
  payload?: any;
}

function escapeJsonValue(value: string | undefined) {
  const o: string[] = [value || ''];
  const str = JSON.stringify(o);
  return str.substring(2, str.length - 2);
}
