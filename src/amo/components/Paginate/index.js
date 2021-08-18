/* @flow */
import * as React from 'react';
import { compose } from 'redux';

import PaginatorLink from 'amo/components/PaginatorLink';
import translate from 'amo/i18n/translate';
import type { I18nType } from 'amo/types/i18n';

import './styles.scss';

type DefaultProps = {|
  pageParam?: string,
  showPages?: number,
|};

type Props = {|
  ...DefaultProps,
  LinkComponent: React.Node,
  count: number,
  currentPage?: string,
  pageCount: number,
  pathname?: string,
  perPage: number,
  queryParams?: Object,
|};

type InternalProps = {|
  ...Props,
  i18n: I18nType,
|};

function makePageNumbers({
  start,
  end,
}: {|
  start: number,
  end: number,
|}): Array<number> {
  const pages = [];
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }
  return pages;
}

export class PaginateBase extends React.Component<InternalProps> {
  static defaultProps: DefaultProps = {
    pageParam: 'page',
    showPages: 7,
  };

  getCurrentPage(): number {
    const currentPage = parseInt(this.props.currentPage, 10);

    return Number.isNaN(currentPage) || currentPage < 1 ? 1 : currentPage;
  }

  visiblePages(): Array<number> {
    const { pageCount, showPages } = this.props;
    if (!showPages) {
      return [];
    }

    const currentPage = this.getCurrentPage();
    const showExtra = Math.floor(showPages / 2);
    const start = Math.max(1, currentPage - showExtra);
    const end = Math.min(pageCount, currentPage + showExtra);

    // If we can show all of the pages, show them all.
    if (pageCount <= showPages) {
      return makePageNumbers({ start: 1, end: pageCount });
      // If we are showing less on the right than we should, define the start by
      // the end.
    }
    if (end - currentPage < showExtra) {
      return makePageNumbers({ start: end - showPages + 1, end });
      // If we are showing less on the left than we should, define the end by the
      // start.
    }
    if (currentPage - start < showExtra) {
      return makePageNumbers({ start, end: start + showPages - 1 });
    }

    // We're showing the maximum number of pages on each side, start and end
    // are correct.
    return makePageNumbers({ start, end });
  }

  render(): null | React.Node {
    const { LinkComponent, i18n, pageCount, pageParam, pathname, queryParams } =
      this.props;

    const currentPage = this.getCurrentPage();

    if (pathname === undefined) {
      throw new Error('The pathname property cannot be undefined');
    }
    if (pageCount === undefined) {
      throw new Error('The pageCount property cannot be undefined');
    }
    if (pageCount === 1) {
      return null;
    }

    const linkParams = {
      LinkComponent,
      currentPage,
      pageCount,
      pathname,
      queryParams,
    };

    return (
      /* eslint-disable react/no-array-index-key */
      <div className="Paginate">
        <div className="Paginate-links">
          <PaginatorLink
            {...linkParams}
            className="Paginate-item--previous"
            page={currentPage - 1}
            pageParam={pageParam}
            text={i18n.gettext('Previous')}
          />

          {this.visiblePages().map((page) => (
            <PaginatorLink
              {...linkParams}
              key={`page-${page}`}
              page={page}
              pageParam={pageParam}
            />
          ))}

          <PaginatorLink
            {...linkParams}
            className="Paginate-item--next"
            page={currentPage + 1}
            pageParam={pageParam}
            text={i18n.gettext('Next')}
          />
        </div>

        <div className="Paginate-page-number">
          {i18n.sprintf(
            i18n.gettext('Page %(currentPage)s of %(totalPages)s'),
            { currentPage, totalPages: pageCount },
          )}
        </div>
      </div>
    );
  }
}

const Paginate: React.ComponentType<Props> = compose(translate())(PaginateBase);

export default Paginate;
