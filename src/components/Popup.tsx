import * as React from 'react';
import * as ReactGA from 'react-ga';
import { DEVELOPERS_URL, DONATE_URL, ISSUES_URL } from 'src/constants';
import { StoredData } from 'src/typings/storedData';
import { WebHook } from 'src/typings/webhook';
import { escapeJsonValue, setBrowserIcon } from 'src/utils';

import './Popup.css';

interface Props {
  webhooks: WebHook[];
  previousIndex: number;
}

interface State {
  content: string;
  selectedIndex: number;
  sendStatus: string;
  error: boolean;
}

export class Popup extends React.PureComponent<Props, State> {
  public constructor(props: Props) {
    super(props);
    let selectedIndex = -1;
    if (this.props.previousIndex >= 0 && this.props.previousIndex < this.props.webhooks.length) {
      selectedIndex = this.props.previousIndex
    } else if (this.props.webhooks.length > 0) {
      selectedIndex = 0;
    }
    this.state = {
      content: '',
      selectedIndex,
      sendStatus: '',
      error: false
    }
  }

  public render() {
    return (
      <div className='popup'>
        <div className='arbitrary'>
          <label className='title'>Send arbitrary</label>
          <textarea value={this.state.content} onChange={this.onTextChange} />
          <div className='buttons'>
            <select onChange={this.onSelectChange}>
              {
                this.props.webhooks.map((wh, i) => <option key={i} selected={i === this.state.selectedIndex}>{wh.name}</option>)
              }
            </select>
            <label className={this.state.error ? 'error' : ''} >{this.state.sendStatus}</label>
            <button onClick={this.onSend}>Send</button>
          </div>
        </div>
        <hr />
        <a href='#' onClick={this.openOptionsPage}>Options</a>
        <hr />
        <a href='#' onClick={this.openDevelopersPage}>Developer's page</a>
        <a href='#' onClick={this.openIssuesPage}>Report an issue</a>
        <a href='#' onClick={this.openDonatePage}>Donate!</a>
      </div>
    );
  }

  private openOptionsPage = () => {
    chrome.runtime.openOptionsPage();
  }

  private openDevelopersPage = () => {
    chrome.tabs.create({ url: DEVELOPERS_URL })
  }

  private openIssuesPage = () => {
    chrome.tabs.create({ url: ISSUES_URL })
  }

  private openDonatePage = () => {
    chrome.tabs.create({ url: DONATE_URL })
  }

  private onTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const content = e.currentTarget.value;
    this.setState(s => ({ ...s, content }));
  }

  private onSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedIndex = e.currentTarget.selectedIndex;
    this.setState(s => ({ ...s, selectedIndex }));
  }

  private onSend = () => {
    const content = escapeJsonValue(this.state.content);
    if (this.state.selectedIndex === -1) {
      return;
    }
    const webhook = this.props.webhooks[this.state.selectedIndex];
    const webaction = webhook.action;
    if (webaction !== undefined) {
      const { method, url, payload } = webaction;
      let body;
      if (payload !== undefined) {
        body = JSON.stringify(payload).replace('%s', content);
      }
      setBrowserIcon('Sending');
      this.setState(s => ({ ...s, sendStatus: 'Sending...', error: false }));
      fetch(url, {
        method: method || 'POST',
        body,
        mode: 'no-cors'
      }).then((resp) => {
        if (resp.status >= 400) {
          setBrowserIcon('Error', `Error: ${resp.status}`);
          this.setState(s => ({ ...s, sendStatus: `${resp.status}`, error: true }));
        } else {
          setBrowserIcon('OK');
          this.setState(s => ({ ...s, sendStatus: 'Sent.', error: false }));
          setTimeout(() => {
            setBrowserIcon('Default');
            this.setState(s => ({ ...s, sendStatus: '', error: false }));
          }, 750);
        }
      }).catch((err: Error) => {
        setBrowserIcon('Error', `Error: ${err.message}`);
        this.setState(s => ({ ...s, sendStatus: `${err.message}`, error: true }));
      });

      // save last hook
      const data: Partial<StoredData> = {
        previousIndex: this.state.selectedIndex
      };
      chrome.storage.sync.set(data);

      // @see: http://stackoverflow.com/a/22152353/1958200
      ReactGA.set({ checkProtocolTask: null });
      ReactGA.send({
        hitType: 'event',
        eventCategory: 'arbitrary',
        eventAction: 'webhook'
      });
    }
  }
}
