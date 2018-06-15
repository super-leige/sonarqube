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
/* eslint-disable react/jsx-sort-props */
import React from 'react';
import { render } from 'react-dom';
import { Router, Route, IndexRoute, Redirect } from 'react-router';
import { Provider } from 'react-redux';
import getStore from './getStore';
import getHistory from './getHistory';
import LocalizationContainer from '../components/LocalizationContainer';
import MigrationContainer from '../components/MigrationContainer';
import App from '../components/App';
import GlobalContainer from '../components/GlobalContainer';
import aboutRoutes from '../../apps/about/routes';
import accountRoutes from '../../apps/account/routes';
import backgroundTasksRoutes from '../../apps/background-tasks/routes';
import codeRoutes from '../../apps/code/routes';
import codingRulesRoutes from '../../apps/coding-rules/routes';
import componentRoutes from '../../apps/component/routes';
import componentMeasuresRoutes from '../../apps/component-measures/routes';
import customMeasuresRoutes from '../../apps/custom-measures/routes';
import groupsRoutes from '../../apps/groups/routes';
import Issues from '../../apps/issues/components/AppContainer';
import Explore from '../../apps/explore/Explore';
import ExploreIssues from '../../apps/explore/ExploreIssues';
import ExploreProjects from '../../apps/explore/ExploreProjects';
import IssuesPageSelector from '../../apps/issues/IssuesPageSelector';
import marketplaceRoutes from '../../apps/marketplace/routes';
import customMetricsRoutes from '../../apps/custom-metrics/routes';
import overviewRoutes from '../../apps/overview/routes';
import organizationsRoutes from '../../apps/organizations/routes';
import permissionTemplatesRoutes from '../../apps/permission-templates/routes';
import portfolioRoutes from '../../apps/portfolio/routes';
import projectActivityRoutes from '../../apps/projectActivity/routes';
import projectBranchesRoutes from '../../apps/projectBranches/routes';
import projectQualityGateRoutes from '../../apps/projectQualityGate/routes';
import projectQualityProfilesRoutes from '../../apps/projectQualityProfiles/routes';
import projectsRoutes from '../../apps/projects/routes';
import projectsManagementRoutes from '../../apps/projectsManagement/routes';
import qualityGatesRoutes from '../../apps/quality-gates/routes';
import qualityProfilesRoutes from '../../apps/quality-profiles/routes';
import sessionsRoutes from '../../apps/sessions/routes';
import settingsRoutes from '../../apps/settings/routes';
import systemRoutes from '../../apps/system/routes';
import usersRoutes from '../../apps/users/routes';
import webAPIRoutes from '../../apps/web-api/routes';
import documentationRoutes from '../../apps/documentation/routes';
import webhooksRoutes from '../../apps/webhooks/routes';
import { maintenanceRoutes, setupRoutes } from '../../apps/maintenance/routes';
import { globalPermissionsRoutes, projectPermissionsRoutes } from '../../apps/permissions/routes';
import { lazyLoad } from '../../components/lazyLoad';

function handleUpdate() {
  const { action } = this.state.location;

  if (action === 'PUSH') {
    window.scrollTo(0, 0);
  }
}

const startReactApp = () => {
  const el = document.getElementById('content');

  const history = getHistory();
  const store = getStore();

  render(
    <Provider store={store}>
      <Router history={history} onUpdate={handleUpdate}>
        <Route
          path="/account/issues"
          onEnter={(_, replace) => {
            replace({ pathname: '/issues', query: { myIssues: 'true', resolved: 'false' } });
          }}
        />

        <Route
          path="/codingrules"
          onEnter={(nextState, replace) => {
            replace('/coding_rules' + window.location.hash);
          }}
        />

        <Route
          path="/dashboard/index/:key"
          onEnter={(nextState, replace) => {
            replace({ pathname: '/dashboard', query: { id: nextState.params.key } });
          }}
        />

        <Route
          path="/issues/search"
          onEnter={(nextState, replace) => {
            replace('/issues' + window.location.hash);
          }}
        />

        <Redirect from="/admin" to="/admin/settings" />
        <Redirect from="/background_tasks" to="/admin/background_tasks" />
        <Redirect from="/component/index" to="/component" />
        <Redirect from="/component_issues" to="/project/issues" />
        <Redirect from="/dashboard/index" to="/dashboard" />
        <Redirect from="/governance" to="/portfolio" />
        <Redirect from="/groups" to="/admin/groups" />
        <Redirect from="/extension/governance/portfolios" to="/portfolios" />
        <Redirect from="/metrics" to="/admin/custom_metrics" />
        <Redirect from="/permission_templates" to="/admin/permission_templates" />
        <Redirect from="/profiles/index" to="/profiles" />
        <Redirect from="/projects_admin" to="/admin/projects_management" />
        <Redirect from="/quality_gates/index" to="/quality_gates" />
        <Redirect from="/roles/global" to="/admin/permissions" />
        <Redirect from="/settings" to="/admin/settings" />
        <Redirect from="/settings/encryption" to="/admin/settings/encryption" />
        <Redirect from="/settings/index" to="/admin/settings" />
        <Redirect from="/sessions/login" to="/sessions/new" />
        <Redirect from="/system" to="/admin/system" />
        <Redirect from="/system/index" to="/admin/system" />
        <Redirect from="/view" to="/portfolio" />
        <Redirect from="/users" to="/admin/users" />

        <Route
          path="markdown/help"
          component={lazyLoad(() => import('../components/MarkdownHelp'))}
        />

        <Route component={LocalizationContainer}>
          <Route component={lazyLoad(() => import('../components/SimpleContainer'))}>
            <Route path="maintenance">{maintenanceRoutes}</Route>
            <Route path="setup">{setupRoutes}</Route>
          </Route>

          <Route component={MigrationContainer}>
            <Route component={lazyLoad(() => import('../components/SimpleSessionsContainer'))}>
              <Route path="/sessions" childRoutes={sessionsRoutes} />
            </Route>

            <Route path="/" component={App}>
              <IndexRoute component={lazyLoad(() => import('../components/Landing'))} />
              <Route path="about" childRoutes={aboutRoutes} />

              <Route component={GlobalContainer}>
                <Route path="account" childRoutes={accountRoutes} />
                <Route path="coding_rules" childRoutes={codingRulesRoutes} />
                <Route path="component" childRoutes={componentRoutes} />
                <Route path="documentation" childRoutes={documentationRoutes} />
                <Route path="explore" component={Explore}>
                  <Route path="issues" component={ExploreIssues} />
                  <Route path="projects" component={ExploreProjects} />
                </Route>
                <Route
                  path="extension/:pluginKey/:extensionKey"
                  component={lazyLoad(() => import('../components/extensions/GlobalPageExtension'))}
                />
                <Route path="issues" component={IssuesPageSelector} />
                <Route
                  path="onboarding"
                  component={lazyLoad(() =>
                    import('../../apps/tutorials/projectOnboarding/ProjectOnboardingPage')
                  )}
                />
                <Route path="organizations" childRoutes={organizationsRoutes} />
                <Route path="projects" childRoutes={projectsRoutes} />
                <Route path="quality_gates" childRoutes={qualityGatesRoutes} />
                <Route
                  path="portfolios"
                  component={lazyLoad(() => import('../components/extensions/PortfoliosPage'))}
                />
                <Route path="profiles" childRoutes={qualityProfilesRoutes} />
                <Route path="web_api" childRoutes={webAPIRoutes} />

                <Route component={lazyLoad(() => import('../components/ComponentContainer'))}>
                  <Route path="code" childRoutes={codeRoutes} />
                  <Route path="component_measures" childRoutes={componentMeasuresRoutes} />
                  <Route path="dashboard" childRoutes={overviewRoutes} />
                  <Route path="portfolio" childRoutes={portfolioRoutes} />
                  <Route path="project/activity" childRoutes={projectActivityRoutes} />
                  <Route
                    path="project/extension/:pluginKey/:extensionKey"
                    component={lazyLoad(() =>
                      import('../components/extensions/ProjectPageExtension')
                    )}
                  />
                  <Route path="project/issues" component={Issues} />
                  <Route path="project/quality_gate" childRoutes={projectQualityGateRoutes} />
                  <Route
                    path="project/quality_profiles"
                    childRoutes={projectQualityProfilesRoutes}
                  />
                  <Route component={lazyLoad(() => import('../components/ProjectAdminContainer'))}>
                    <Route path="custom_measures" childRoutes={customMeasuresRoutes} />
                    <Route
                      path="project/admin/extension/:pluginKey/:extensionKey"
                      component={lazyLoad(() =>
                        import('../components/extensions/ProjectAdminPageExtension')
                      )}
                    />
                    <Route path="project/background_tasks" childRoutes={backgroundTasksRoutes} />
                    <Route path="project/branches" childRoutes={projectBranchesRoutes} />
                    <Route path="project/settings" childRoutes={settingsRoutes} />
                    <Route path="project_roles" childRoutes={projectPermissionsRoutes} />
                    <Route path="project/webhooks" childRoutes={webhooksRoutes} />
                    <Route
                      path="project/deletion"
                      component={lazyLoad(() =>
                        import('../../apps/project-admin/deletion/Deletion')
                      )}
                    />
                    <Route
                      path="project/links"
                      component={lazyLoad(() => import('../../apps/project-admin/links/Links'))}
                    />
                    <Route
                      path="project/key"
                      component={lazyLoad(() => import('../../apps/project-admin/key/Key'))}
                    />
                  </Route>
                </Route>

                <Route
                  component={lazyLoad(() => import('../components/AdminContainer'))}
                  path="admin">
                  <Route
                    path="extension/:pluginKey/:extensionKey"
                    component={lazyLoad(() =>
                      import('../components/extensions/GlobalAdminPageExtension')
                    )}
                  />
                  <Route path="background_tasks" childRoutes={backgroundTasksRoutes} />
                  <Route path="custom_metrics" childRoutes={customMetricsRoutes} />
                  <Route path="groups" childRoutes={groupsRoutes} />
                  <Route path="permission_templates" childRoutes={permissionTemplatesRoutes} />
                  <Route path="roles/global" childRoutes={globalPermissionsRoutes} />
                  <Route path="permissions" childRoutes={globalPermissionsRoutes} />
                  <Route path="projects_management" childRoutes={projectsManagementRoutes} />
                  <Route path="settings" childRoutes={settingsRoutes} />
                  <Route path="system" childRoutes={systemRoutes} />
                  <Route path="marketplace" childRoutes={marketplaceRoutes} />
                  <Route path="users" childRoutes={usersRoutes} />
                  <Route path="webhooks" childRoutes={webhooksRoutes} />
                </Route>
              </Route>
              <Route
                path="not_found"
                component={lazyLoad(() => import('../components/NotFound'))}
              />
              <Route path="*" component={lazyLoad(() => import('../components/NotFound'))} />
            </Route>
          </Route>
        </Route>
      </Router>
    </Provider>,
    el
  );
};

export default startReactApp;
