import {
  Button,
  Menu,
  MenuItem,
  MenuSeparator,
  MenuSub,
} from '@affine/component';
import {
  AllPageListOperationsMenu,
  type PageDisplayProperties,
  type PageGroupByType,
  pageGroupByTypeAtom,
  PageListNewPageButton,
  usePageDisplayProperties,
} from '@affine/core/components/page-list';
import { Header } from '@affine/core/components/pure/header';
import { WorkspaceModeFilterTab } from '@affine/core/components/pure/workspace-mode-filter-tab';
import type { Filter } from '@affine/env/filter';
import { useAFFiNEI18N } from '@affine/i18n/hooks';
import { ArrowDownSmallIcon, DoneIcon, PlusIcon } from '@blocksuite/icons';
import { useService } from '@toeverything/infra';
import { Workspace } from '@toeverything/infra';
import clsx from 'clsx';
import { useAtom } from 'jotai';
import { useCallback, useMemo } from 'react';

import * as styles from './all-page.css';

type GroupOption = {
  value: PageGroupByType;
  label: string;
};

export const AllPageHeader = ({
  showCreateNew,
  filters,
  onChangeFilters,
}: {
  showCreateNew: boolean;
  filters: Filter[];
  onChangeFilters: (filters: Filter[]) => void;
}) => {
  const workspace = useService(Workspace);
  const [group, setGroup] = useAtom(pageGroupByTypeAtom);
  const [properties, setProperties] = usePageDisplayProperties();
  const t = useAFFiNEI18N();
  const handleSelect = useCallback(
    (value: PageGroupByType) => {
      setGroup(value);
    },
    [setGroup]
  );
  const propertyOptions: Array<{
    key: keyof PageDisplayProperties;
    onClick: () => void;
    label: string;
  }> = useMemo(() => {
    return [
      {
        key: 'bodyNotes',
        onClick: () => setProperties('bodyNotes', !properties['bodyNotes']),
        label: t['com.affine.page.display.display-properties.body-notes'](),
      },
      {
        key: 'tags',
        onClick: () => setProperties('tags', !properties['tags']),
        label: t['Tags'](),
      },
      {
        key: 'createDate',
        onClick: () => setProperties('createDate', !properties['createDate']),
        label: t['Created'](),
      },
      {
        key: 'updatedDate',
        onClick: () => setProperties('updatedDate', !properties['updatedDate']),
        label: t['Updated'](),
      },
    ];
  }, [properties, setProperties, t]);

  const items = useMemo(() => {
    const groupOptions: GroupOption[] = [
      {
        value: 'createDate',
        label: t['Created'](),
      },
      {
        value: 'updatedDate',
        label: t['Updated'](),
      },
      {
        value: 'tag',
        label: t['com.affine.page.display.grouping.group-by-tag'](),
      },
      {
        value: 'favourites',
        label: t['com.affine.page.display.grouping.group-by-favourites'](),
      },
      {
        value: 'none',
        label: t['com.affine.page.display.grouping.no-grouping'](),
      },
    ];

    const subItems = groupOptions.map(option => (
      <MenuItem
        key={option.value}
        onSelect={() => handleSelect(option.value)}
        data-active={group === option.value}
        endFix={group === option.value ? <DoneIcon fontSize={'20px'} /> : null}
        className={styles.subMenuItem}
      >
        <span>{option.label}</span>
      </MenuItem>
    ));

    const currentGroupType = groupOptions.find(
      option => option.value === group
    )?.label;

    return (
      <>
        <MenuSub
          subContentOptions={{
            alignOffset: -8,
            sideOffset: 12,
          }}
          triggerOptions={{ className: styles.subMenuTrigger }}
          items={subItems}
        >
          <div className={styles.subMenuTriggerContent}>
            <span>{t['com.affine.page.display.grouping']()}</span>
            <span className={styles.currentGroupType}>{currentGroupType}</span>
          </div>
        </MenuSub>
        <MenuSeparator />
        <div className={styles.listOption}>
          {t['com.affine.page.display.list-option']()}
        </div>
        <div className={styles.properties}>
          {t['com.affine.page.display.display-properties']()}
        </div>
        <div className={styles.propertiesWrapper}>
          {propertyOptions.map(option => (
            <Button
              key={option.label}
              className={styles.propertyButton}
              onClick={option.onClick}
              data-active={properties[option.key]}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </>
    );
  }, [group, handleSelect, properties, propertyOptions, t]);

  return (
    <Header
      left={
        <AllPageListOperationsMenu
          filterList={filters}
          onChangeFilterList={onChangeFilters}
          propertiesMeta={workspace.docCollection.meta.properties}
        />
      }
      right={
        <>
          <PageListNewPageButton
            size="small"
            className={clsx(
              styles.headerCreateNewButton,
              !showCreateNew && styles.headerCreateNewButtonHidden
            )}
          >
            <PlusIcon />
          </PageListNewPageButton>
          <Menu
            items={items}
            contentOptions={{
              className: styles.menu,

              align: 'end',
            }}
          >
            <Button
              iconPosition="end"
              icon={
                <ArrowDownSmallIcon className={styles.arrowDownSmallIcon} />
              }
              className={styles.headerDisplayButton}
            >
              {t['com.affine.page.display']()}
            </Button>
          </Menu>
        </>
      }
      center={<WorkspaceModeFilterTab activeFilter={'docs'} />}
    />
  );
};
