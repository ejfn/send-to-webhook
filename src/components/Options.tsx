import * as React from 'react';
import { HOWTO_CONFIG_URL } from 'src/constants';
import { StoredData } from 'src/typings/storedData';
import { WebHook } from 'src/typings/webhook';

import './Options.css';

interface Props {
  webhooks: WebHook[];
}

interface State {
  text: string;
  saveStatus: string;
  error: boolean;
}

export class Options extends React.PureComponent<Props, State> {

  public constructor(props: Props) {
    super(props);
    this.state = {
      text: JSON.stringify(this.props.webhooks, null, 2),
      saveStatus: '',
      error: false
    }
  }

  public render() {
    return (
      <div className='options'>
        <h3>WebHooks</h3>
        <textarea rows={25} cols={80} value={this.state.text} onChange={this.onTextChange} />
        <div>
          <a href={HOWTO_CONFIG_URL}>How to configure this?</a>
        </div>
        <div className='buttons'>
          <button onClick={this.onSave}>Save &amp; Close</button>
          <span className={this.state.error ? 'error' : undefined}>{this.state.saveStatus}</span>
        </div>
      </div>
    );
  }

  private onTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.currentTarget.value;
    this.setState(s => ({ ...s, text }));
  }

  private onSave = () => {
    let webhooks: WebHook[];
    try {
      webhooks = JSON.parse(this.state.text);
      if (!(webhooks instanceof Array)) {
        throw new Error('Invalid json!');
      }
    } catch {
      this.setState(s => ({
        saveStatus: 'Invalid json!',
        error: true
      }));
      return;
    }
    const data: Partial<StoredData> = {
      webhooks: JSON.stringify(webhooks)
    };
    chrome.storage.sync.set(data, () => {
      // reload extension
      chrome.runtime.reload();
      this.setState(s => ({
        saveStatus: 'Options saved.',
        error: false
      }));
      setTimeout(() => {
        this.setState(s => ({
          saveStatus: '',
        }));
        window.close();
      }, 750);
    });
  }
}
