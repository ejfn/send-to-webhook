import * as queryString from 'query-string';
import * as React from 'react';
import * as ReactGA from 'react-ga';
import { Background } from 'src/components/Background';
import { Options } from 'src/components/Options';
import { Popup } from 'src/components/Popup';
import { StoredData } from 'src/typings/storedData';
import { WebHook } from 'src/typings/webhook';

interface Params {
  page?: 'background' | 'options' | 'popup';
}

interface Props {
}

interface State {
  params: Params;
  webhooks: WebHook[];
  previousIndex: number;
  initialised: boolean;
}

export class App extends React.PureComponent<Props, State> {
  public constructor(props: Props) {
    super(props);
    const params = queryString.parse(window.location.search);
    this.state = {
      params,
      webhooks: [],
      previousIndex: -1,
      initialised: false
    }
  }

  public componentDidMount() {
    ReactGA.initialize('UA-73153112-6');
    this.loadConfig();
  }

  public render() {
    if (!this.state.initialised) {
      // not initialised
      return <div />;
    }
    switch (this.state.params.page) {
      case 'background':
        return <Background webhooks={this.state.webhooks} />;
      case 'options':
        return <Options webhooks={this.state.webhooks} />;
      case 'popup':
        return <Popup webhooks={this.state.webhooks} previousIndex={this.state.previousIndex} />;
      default:
        return <div>404 - Page Not Found</div>;
    }
  }

  private loadConfig() {
    const data: StoredData = {
      webhooks: '[]',
      previousIndex: -1
    };
    chrome.storage.sync.get(data, (items: StoredData) => {
      const webhooks: WebHook[] = JSON.parse(items.webhooks);
      const previousIndex: number = items.previousIndex;
      this.setState(s => ({
        ...s,
        webhooks,
        previousIndex,
        initialised: true
      }));
    });
  }
}
