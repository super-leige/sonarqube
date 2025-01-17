/*
 * SonarQube
 * Copyright (C) 2009-2023 SonarSource SA
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
package org.sonar.server.user.index;

import java.util.Collections;
import java.util.List;
import java.util.Locale;
import org.junit.Rule;
import org.junit.Test;
import org.sonar.api.utils.System2;
import org.sonar.core.util.Uuids;
import org.sonar.server.es.EsTester;
import org.sonar.server.es.SearchOptions;

import static java.util.Arrays.asList;
import static java.util.Collections.singletonList;
import static org.assertj.core.api.Assertions.assertThat;
import static org.sonar.server.user.index.UserIndexDefinition.TYPE_USER;

public class UserIndexIT {

  private static final String USER1_LOGIN = "user1";
  private static final String USER2_LOGIN = "user2";
  private static final String USER3_LOGIN = "user3";

  @Rule
  public EsTester es = EsTester.create();

  private UserIndex underTest = new UserIndex(es.client(), System2.INSTANCE);
  private UserQuery.Builder userQuery = UserQuery.builder();

  @Test
  public void getAtMostThreeActiveUsersForScmAccount_returns_the_users_with_specified_scm_account() {
    UserDoc user1 = newUser("user1", asList("user_1", "u1"));
    UserDoc user2 = newUser("user_with_same_email_as_user1", asList("user_2")).setEmail(user1.email());
    UserDoc user3 = newUser("inactive_user_with_same_scm_as_user1", user1.scmAccounts()).setActive(false);
    es.putDocuments(TYPE_USER, user1);
    es.putDocuments(TYPE_USER, user2);
    es.putDocuments(TYPE_USER, user3);

    assertThat(underTest.getAtMostThreeActiveUsersForScmAccount(user1.scmAccounts().get(0))).extractingResultOf("login").containsOnly(user1.login());
    assertThat(underTest.getAtMostThreeActiveUsersForScmAccount(user1.login())).extractingResultOf("login").containsOnly(user1.login());

    // both users share the same email
    assertThat(underTest.getAtMostThreeActiveUsersForScmAccount(user1.email())).extracting(UserDoc::login).containsOnly(user1.login(), user2.login());

    assertThat(underTest.getAtMostThreeActiveUsersForScmAccount("")).isEmpty();
    assertThat(underTest.getAtMostThreeActiveUsersForScmAccount("unknown")).isEmpty();
  }

  @Test
  public void getAtMostThreeActiveUsersForScmAccount_ignores_inactive_user() {
    String scmAccount = "scmA";
    UserDoc user = newUser(USER1_LOGIN, singletonList(scmAccount)).setActive(false);
    es.putDocuments(TYPE_USER, user);

    assertThat(underTest.getAtMostThreeActiveUsersForScmAccount(user.login())).isEmpty();
    assertThat(underTest.getAtMostThreeActiveUsersForScmAccount(scmAccount)).isEmpty();
  }

  @Test
  public void getAtMostThreeActiveUsersForScmAccount_returns_maximum_three_users() {
    String email = "user@mail.com";
    UserDoc user1 = newUser("user1", Collections.emptyList()).setEmail(email);
    UserDoc user2 = newUser("user2", Collections.emptyList()).setEmail(email);
    UserDoc user3 = newUser("user3", Collections.emptyList()).setEmail(email);
    UserDoc user4 = newUser("user4", Collections.emptyList()).setEmail(email);
    es.putDocuments(TYPE_USER, user1);
    es.putDocuments(TYPE_USER, user2);
    es.putDocuments(TYPE_USER, user3);
    es.putDocuments(TYPE_USER, user4);

    // restrict results to 3 users
    assertThat(underTest.getAtMostThreeActiveUsersForScmAccount(email)).hasSize(3);
  }

  @Test
  public void getAtMostThreeActiveUsersForScmAccount_is_case_sensitive_for_login() {
    UserDoc user = newUser("the_login", singletonList("John.Smith"));
    es.putDocuments(TYPE_USER, user);

    assertThat(underTest.getAtMostThreeActiveUsersForScmAccount("the_login")).hasSize(1);
    assertThat(underTest.getAtMostThreeActiveUsersForScmAccount("the_Login")).isEmpty();
  }

  @Test
  public void getAtMostThreeActiveUsersForScmAccount_is_case_insensitive_for_email() {
    UserDoc user = newUser("the_login", "the_EMAIL@corp.com", singletonList("John.Smith"));
    es.putDocuments(TYPE_USER, user);

    assertThat(underTest.getAtMostThreeActiveUsersForScmAccount("the_EMAIL@corp.com")).hasSize(1);
    assertThat(underTest.getAtMostThreeActiveUsersForScmAccount("the_email@corp.com")).hasSize(1);
    assertThat(underTest.getAtMostThreeActiveUsersForScmAccount("email")).isEmpty();
  }

  @Test
  public void getAtMostThreeActiveUsersForScmAccount_is_case_insensitive_for_scm_account() {
    UserDoc user = newUser("the_login", singletonList("John.Smith"));
    es.putDocuments(TYPE_USER, user);

    assertThat(underTest.getAtMostThreeActiveUsersForScmAccount("John.Smith")).hasSize(1);
    assertThat(underTest.getAtMostThreeActiveUsersForScmAccount("JOHN.SMIth")).hasSize(1);
    assertThat(underTest.getAtMostThreeActiveUsersForScmAccount("JOHN.SMITH")).hasSize(1);
    assertThat(underTest.getAtMostThreeActiveUsersForScmAccount("JOHN")).isEmpty();
  }

  @Test
  public void searchUsers() {
    es.putDocuments(TYPE_USER, newUser(USER1_LOGIN, asList("user_1", "u1")).setEmail("email1"));
    es.putDocuments(TYPE_USER, newUser(USER2_LOGIN, Collections.emptyList()).setEmail("email2"));
    es.putDocuments(TYPE_USER, newUser(USER3_LOGIN, Collections.emptyList()).setEmail("email3").setActive(false));

    assertThat(underTest.search(userQuery.build(), new SearchOptions()).getDocs()).hasSize(2);
    assertThat(underTest.search(userQuery.setTextQuery("user").build(), new SearchOptions()).getDocs()).hasSize(2);
    assertThat(underTest.search(userQuery.setTextQuery("ser").build(), new SearchOptions()).getDocs()).hasSize(2);
    assertThat(underTest.search(userQuery.setTextQuery(USER1_LOGIN).build(), new SearchOptions()).getDocs()).hasSize(1);
    assertThat(underTest.search(userQuery.setTextQuery(USER2_LOGIN).build(), new SearchOptions()).getDocs()).hasSize(1);
    assertThat(underTest.search(userQuery.setTextQuery("mail").build(), new SearchOptions()).getDocs()).hasSize(2);
    assertThat(underTest.search(userQuery.setTextQuery("EMAIL1").build(), new SearchOptions()).getDocs()).hasSize(1);

    // deactivated users
    assertThat(underTest.search(userQuery.setActive(false).setTextQuery(null).build(), new SearchOptions()).getDocs()).hasSize(1);
    assertThat(underTest.search(userQuery.setActive(false).setTextQuery("email3").build(), new SearchOptions()).getDocs()).hasSize(1);
  }

  private static UserDoc newUser(String login, List<String> scmAccounts) {
    return new UserDoc()
      .setUuid(Uuids.createFast())
      .setLogin(login)
      .setName(login.toUpperCase(Locale.ENGLISH))
      .setEmail(login + "@mail.com")
      .setActive(true)
      .setScmAccounts(scmAccounts);
  }

  private static UserDoc newUser(String login, String email, List<String> scmAccounts) {
    return new UserDoc()
      .setUuid(Uuids.createFast())
      .setLogin(login)
      .setName(login.toUpperCase(Locale.ENGLISH))
      .setEmail(email)
      .setActive(true)
      .setScmAccounts(scmAccounts);
  }
}
