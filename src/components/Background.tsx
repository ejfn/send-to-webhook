import * as React from 'react';
import * as ReactGA from 'react-ga';
import { WebHook, WebHookAction } from 'src/typings/webhook';
import { escapeJsonValue } from 'src/utils';

interface Props {
  webhooks: WebHook[];
}

export class Background extends React.PureComponent<Props> {

  public constructor(props: Props) {
    super(props);
  }

  public render() {
    this.createContextMenus();
    return <div />;
  }

  private createContextMenus() {
    chrome.contextMenus.removeAll(() => {
      for (const webhook of this.props.webhooks) {
        const isLink = webhook.targetUrlPatterns !== undefined && webhook.targetUrlPatterns.length > 0;
        if (isLink) {
          chrome.contextMenus.create({
            documentUrlPatterns: webhook.documentUrlPatterns,
            title: `Send Link to ${webhook.name}`,
            contexts: ['link'],
            targetUrlPatterns: webhook.targetUrlPatterns,
            onclick: (info) => {
              this.send(info.linkUrl, webhook.action);
            }
          });
          chrome.contextMenus.create({
            documentUrlPatterns: webhook.documentUrlPatterns,
            title: `Send Image to ${webhook.name}`,
            contexts: ['image'],
            targetUrlPatterns: webhook.targetUrlPatterns,
            onclick: (info) => {
              this.send(info.srcUrl, webhook.action);
            }
          });
        } else {
          chrome.contextMenus.create({
            documentUrlPatterns: webhook.documentUrlPatterns,
            title: `Send "%s" to ${webhook.name}`,
            contexts: ['selection'],
            onclick: (info) => {
              this.send(escapeJsonValue(info.selectionText), webhook.action);
            }
          });
        }
      }
    });
  }

  private send(param: string | undefined, action: WebHookAction) {
    if (param !== undefined && action !== undefined) {
      const { method, url, payload } = action;
      let body;
      if (payload !== undefined) {
        body = JSON.stringify(payload).replace('%s', param);
      }
      fetch(url, {
        method: method || 'POST',
        body,
        mode: 'no-cors'
      }).then((resp) => {
        alert(resp.status >= 400 ? `Error: ${resp.status}` : 'Successfully Sent!');
      }).catch((reason) => {
        alert(`Error: ${reason}`);
      });

      // @see: http://stackoverflow.com/a/22152353/1958200
      ReactGA.set({ checkProtocolTask: null });
      ReactGA.send({
        hitType: 'event',
        eventCategory: 'contextMenu',
        eventAction: 'webhook'
      });

    } else {
      alert('Error: Webhook action is not defined.');
    }
  }

}
