/* @flow */
import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';

import HeadLinks from 'amo/components/HeadLinks';
import Page from 'amo/components/Page';
import Search from 'amo/components/Search';
import { DEFAULT_TAG_SORT } from 'amo/constants';
import { withFixedErrorHandler } from 'amo/errorHandler';
import translate from 'amo/i18n/translate';
import {
  convertFiltersToQueryParams,
  convertQueryParamsToFilters,
  fixFiltersFromLocation,
} from 'amo/searchUtils';
import type { SearchFilters } from 'amo/api/search';
import type { AppState } from 'amo/store';
import type { I18nType } from 'amo/types/i18n';
import type { ReactRouterMatchType } from 'amo/types/router';

type Props = {|
  match: {|
    ...ReactRouterMatchType,
    params: {| tag: string, visibleAddonType: string |},
  |},
|};

type PropsFromState = {|
  filters: SearchFilters,
|};

type InternalProps = {|
  ...Props,
  ...PropsFromState,
  i18n: I18nType,
|};

export class TagPageBase extends React.Component<InternalProps> {
  getPageTitle(tag: string): string {
    const { i18n } = this.props;

    return i18n.sprintf(i18n.gettext('Add-ons tagged with %(tag)s'), {
      tag,
    });
  }

  render(): React.Node {
    const { filters, match } = this.props;
    const { tag } = match.params;

    const filtersForSearch = {
      ...filters,
      tag,
      sort: filters.sort || DEFAULT_TAG_SORT,
    };

    return (
      <Page>
        <HeadLinks />
        <Search
          enableSearchFilters
          filters={filtersForSearch}
          pageTitle={this.getPageTitle(tag)}
          paginationQueryParams={convertFiltersToQueryParams(filters)}
          pathname={`/tag/${tag}/`}
        />
      </Page>
    );
  }
}

const mapStateToProps = (state: AppState): PropsFromState => {
  const { location } = state.router;

  const filtersFromLocation = convertQueryParamsToFilters(location.query);

  return {
    filters: fixFiltersFromLocation(filtersFromLocation),
  };
};

export const extractId = (ownProps: Props): string => {
  return ownProps.match.params.tag;
};

const TagPage: React.ComponentType<Props> = compose(
  connect(mapStateToProps),
  translate(),
  withFixedErrorHandler({ fileName: __filename, extractId }),
)(TagPageBase);

export default TagPage;
