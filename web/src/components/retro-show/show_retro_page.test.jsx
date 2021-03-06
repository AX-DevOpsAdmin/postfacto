/*
 * Postfacto, a free, open-source and self-hosted retro tool aimed at helping
 * remote teams.
 *
 * Copyright (C) 2016 - Present Pivotal Software, Inc.
 *
 * This program is free software: you can redistribute it and/or modify
 *
 * it under the terms of the GNU Affero General Public License as
 *
 * published by the Free Software Foundation, either version 3 of the
 *
 * License, or (at your option) any later version.
 *
 *
 *
 * This program is distributed in the hope that it will be useful,
 *
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 *
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *
 * GNU Affero General Public License for more details.
 *
 *
 *
 * You should have received a copy of the GNU Affero General Public License
 *
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import React from 'react';
import {mount} from 'enzyme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import Dialog from 'material-ui/Dialog';
import '../../spec_helper';
import goof from '../../test_support/test_doubles/goof';

import {ShowRetroPage} from './show_retro_page';
import RetroWebsocket from './retro_websocket';
import ArchiveRetroDialog from './archive_retro_dialog';
import ShareRetroDialog from './share_retro_dialog';

const config = {
  title: 'Retro',
  api_base_url: 'https://example.com',
  websocket_port: 1234,
  websocket_url: 'ws://websocket/url',
  contact: '',
  terms: '',
  privacy: '',
};

function createRetro(isPrivate = false) {
  return {
    id: 13,
    name: 'the retro name',
    is_private: isPrivate,
    video_link: 'http://the/video/link',
    send_archive_email: false,
    items: [
      {
        id: 1,
        description: 'the happy retro item',
        category: 'happy',
      },
      {
        id: 2,
        description: 'the meh retro item',
        category: 'meh',
      },
      {
        id: 3,
        description: 'the sad retro item',
        category: 'sad',
      },
    ],
    action_items: [],
  };
}

function UnconnectedShowRetroPage(props) {
  return (
    <ShowRetroPage
      getRetro={jest.fn()}
      nextRetroItem={jest.fn()}
      archiveRetro={jest.fn()}
      getRetroArchive={jest.fn()}
      toggleSendArchiveEmail={jest.fn()}
      routeToRetroArchives={jest.fn()}
      routeToRetroSettings={jest.fn()}
      requireRetroLogin={jest.fn()}
      showDialog={jest.fn()}
      signOut={jest.fn()}
      hideDialog={goof}
      voteRetroItem={goof}
      doneRetroItem={goof}
      undoneRetroItem={goof}
      highlightRetroItem={goof}
      unhighlightRetroItem={goof}
      updateRetroItem={goof}
      deleteRetroItem={goof}
      deleteRetroActionItem={goof}
      createRetroItem={goof}
      createRetroActionItem={goof}
      doneRetroActionItem={goof}
      editRetroActionItem={goof}
      extendTimer={goof}
      websocketRetroDataReceived={goof}
      {...props}
    />
  );
}

describe('ShowRetroPage', () => {
  let environment;

  beforeEach(() => {
    environment = {isMobile640: false};
  });

  describe('private retro', () => {
    const retro = createRetro(true);

    it('does not show the privacy and terms banner on mobile', () => {
      environment.isMobile640 = true;

      const dom = mount((
        <MuiThemeProvider>
          <UnconnectedShowRetroPage
            retro={retro}
            retroId="13"
            archives={false}
            config={config}
            featureFlags={{archiveEmails: true}}
            environment={environment}
          />
        </MuiThemeProvider>
      ));

      expect(dom.find('.banner')).not.toExist();
    });

    it('does not show the privacy and terms banner on desktop', () => {
      environment.isMobile640 = false;

      const dom = mount((
        <MuiThemeProvider>
          <UnconnectedShowRetroPage
            retro={retro}
            retroId="13"
            archives={false}
            config={config}
            featureFlags={{archiveEmails: true}}
            environment={environment}
          />
        </MuiThemeProvider>
      ));

      expect(dom.find('.banner')).not.toExist();
    });
  });

  describe('on desktop', () => {
    let retro;
    let dom;

    beforeEach(() => {
      environment.isMobile640 = false;
      retro = createRetro();

      dom = mount((
        <MuiThemeProvider>
          <UnconnectedShowRetroPage
            retro={retro}
            retroId="13"
            archives={false}
            config={config}
            featureFlags={{archiveEmails: true}}
            environment={environment}
          />
        </MuiThemeProvider>
      ));
    });

    it('displays title', () => {
      expect(dom.find('.retro-name')).toIncludeText('the retro name');
    });

    it('displays columns', () => {
      const happy = dom.find('.column-happy');
      expect(happy.find('.item-text').at(0)).toIncludeText('the happy retro item');
      expect(happy.find('textarea')).toHaveProp({placeholder: 'I\'m glad that...'});

      const meh = dom.find('.column-meh');
      expect(meh.find('.item-text').at(0)).toIncludeText('the meh retro item');
      expect(meh.find('textarea')).toHaveProp({placeholder: 'I\'m wondering about...'});

      const sad = dom.find('.column-sad');
      expect(sad.find('.item-text').at(0)).toIncludeText('the sad retro item');
      expect(sad.find('textarea')).toHaveProp({placeholder: 'It wasn\'t so great that...'});
    });

    it('displays a menu', () => {
      expect(dom.find('.retro-menu')).toIncludeText('MENU');
    });

    it('does not display a back button', () => {
      expect(dom.find('.retro-back')).not.toExist();
    });

    it('displays the archive dialog if requested', () => {
      dom = mount((
        <MuiThemeProvider>
          <UnconnectedShowRetroPage
            retro={retro}
            retroId="13"
            archives={false}
            config={config}
            dialog={{
              title: 'Some dialog title',
              message: 'Some dialog message',
              type: 'ARCHIVE_RETRO',
            }}
            featureFlags={{archiveEmails: true}}
            environment={environment}
          />
        </MuiThemeProvider>
      ));
      expect(dom.find(ArchiveRetroDialog)).toExist();
    });

    it('displays the share retro dialog if requested', () => {
      dom = mount((
        <MuiThemeProvider>
          <UnconnectedShowRetroPage
            retro={retro}
            retroId="13"
            archives={false}
            config={config}
            dialog={{
              type: 'SHARE_RETRO',
            }}
            featureFlags={{archiveEmails: true}}
            environment={environment}
          />
        </MuiThemeProvider>
      ));
      expect(dom.find(ShareRetroDialog)).toExist();
    });

    it('does not display any dialog by default', () => {
      expect(dom.find(Dialog)).not.toExist();
    });

    it('passes the retro URL to RetroWebsocket', () => {
      expect(dom.find(RetroWebsocket).prop('url')).toBe('ws://websocket:1234/url');
    });
  });

  describe('on mobile', () => {
    let retro;
    let dom;

    beforeEach(() => {
      environment.isMobile640 = true;
      retro = createRetro();

      dom = mount((
        <MuiThemeProvider>
          <UnconnectedShowRetroPage
            retro={retro}
            retroId="13"
            archives={false}
            config={config}
            featureFlags={{archiveEmails: true}}
            environment={environment}
          />
        </MuiThemeProvider>
      ));
    });

    it('displays title', () => {
      expect(dom.find('.retro-name')).toIncludeText('the retro name');
    });

    it('displays tabs', () => {
      expect(dom.find('.mobile-tab-happy')).toIncludeText('Happy');
      expect(dom.find('.mobile-tab-meh')).toIncludeText('Meh');
      expect(dom.find('.mobile-tab-sad')).toIncludeText('Sad');
      expect(dom.find('.mobile-tab-action')).toIncludeText('Action');
      expect(dom.find('.retro-item-list-header')).not.toExist();
    });

    it('displays the happy tab by default', () => {
      expect(dom.find('.column-happy .item-text').at(0)).toIncludeText('the happy retro item');
      expect(dom.find('.column-happy textarea')).toHaveProp({placeholder: 'I\'m glad that...'});
    });

    it('displays a menu with a mobile class name', () => {
      expect(dom.find('.retro-menu-mobile')).toIncludeText('MENU');
    });

    it('does not display a back button', () => {
      expect(dom.find('.retro-back')).not.toExist();
    });

    it('passes the retro URL to RetroWebsocket', () => {
      expect(dom.find(RetroWebsocket).prop('url')).toBe('ws://websocket:1234/url');
    });
  });
});
