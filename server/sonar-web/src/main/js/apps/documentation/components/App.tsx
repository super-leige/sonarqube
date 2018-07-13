/*
 * SonarQube
 * Copyright (C) 2009-2018 SonarSource SA
 * mailto:info AT sonarsource DOT com
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program; if not, write to the Free Software Foundation,
 * Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 */
import * as React from 'react';
import Helmet from 'react-helmet';
import { Link } from 'react-router';
import Sidebar from './Sidebar';
import getPages from '../pages';
import NotFound from '../../../app/components/NotFound';
import ScreenPositionHelper from '../../../components/common/ScreenPositionHelper';
import DocMarkdownBlock from '../../../components/docs/DocMarkdownBlock';
import { translate } from '../../../helpers/l10n';
import { isSonarCloud } from '../../../helpers/system';
import '../styles.css';

interface Props {
  params: { splat?: string };
}

export default class App extends React.PureComponent<Props> {
  mounted = false;
  pages = getPages();

  componentDidMount() {
    const footer = document.getElementById('footer');
    if (footer) {
      footer.classList.add('page-footer-with-sidebar', 'documentation-footer');
    }
  }

  componentWillUnmount() {
    const footer = document.getElementById('footer');
    if (footer) {
      footer.classList.remove('page-footer-with-sidebar', 'documentation-footer');
    }
  }

  render() {
    const { splat = 'index' } = this.props.params;
    const page = this.pages.find(p => p.relativeName === splat);
    const mainTitle = translate('documentation.page');

    if (!page) {
      return (
        <>
          <Helmet title={mainTitle}>
            <meta content="noindex nofollow" name="robots" />
          </Helmet>
          <NotFound withContainer={false} />
        </>
      );
    }

    const isIndex = splat === 'index';

    return (
      <div className="layout-page">
        <Helmet title={isIndex ? mainTitle : `${page.title} - ${mainTitle}`}>
          {!isSonarCloud() && <meta content="noindex nofollow" name="robots" />}
        </Helmet>

        <ScreenPositionHelper className="layout-page-side-outer">
          {({ top }) => (
            <div className="layout-page-side" style={{ top }}>
              <div className="layout-page-side-inner">
                <div className="layout-page-filters">
                  <div className="web-api-page-header">
                    <Link to="/documentation/">
                      <h1>{translate('documentation.page')}</h1>
                    </Link>
                  </div>
                  <Sidebar pages={this.pages} splat={splat} />
                </div>
              </div>
            </div>
          )}
        </ScreenPositionHelper>

        <div className="layout-page-main">
          <div className="layout-page-main-inner documentation-layout-inner">
            <div className="boxed-group">
              <DocMarkdownBlock
                className="documentation-content cut-margins boxed-group-inner"
                content={page.content}
                displayH1={true}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
}
