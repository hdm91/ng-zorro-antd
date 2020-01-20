/**
 * @license
 * Copyright Alibaba.com All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { Direction, Directionality } from '@angular/cdk/bidi';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
  TemplateRef,
  ViewEncapsulation
} from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NzMenuModeType } from './menu.types';

@Component({
  selector: '[nz-submenu-title]',
  exportAs: 'nzSubmenuTitle',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <i nz-icon [nzType]="nzIcon" *ngIf="nzIcon"></i>
    <ng-container *nzStringTemplateOutlet="nzTitle">
      <span>{{ nzTitle }}</span>
    </ng-container>
    <ng-content></ng-content>
    <span [ngSwitch]="dir" *ngIf="isMenuInsideDropDown; else notDropdownTpl" class="ant-dropdown-menu-submenu-arrow">
      <i *ngSwitchCase="'rtl'" nz-icon nzType="left" class="ant-dropdown-menu-submenu-arrow-icon"></i>
      <i *ngSwitchDefault nz-icon nzType="right" class="ant-dropdown-menu-submenu-arrow-icon"></i>
    </span>
    <ng-template #notDropdownTpl>
      <i class="ant-menu-submenu-arrow"></i>
    </ng-template>
  `,
  host: {
    '[class.ant-dropdown-menu-submenu-title]': 'isMenuInsideDropDown',
    '[class.ant-menu-submenu-title]': '!isMenuInsideDropDown',
    '[style.paddingLeft.px]': `dir === 'rtl' ? 0 : paddingLeft `,
    '[style.paddingRight.px]': `dir === 'rtl' ? paddingLeft : 0`,
    '(click)': 'clickTitle()',
    '(mouseenter)': 'setMouseState(true)',
    '(mouseleave)': 'setMouseState(false)'
  }
})
export class NzSubMenuTitleComponent implements OnDestroy {
  @Input() nzIcon: string | null = null;
  @Input() nzTitle: string | TemplateRef<void> | null = null;
  @Input() isMenuInsideDropDown = false;
  @Input() nzDisabled = false;
  @Input() paddingLeft: number | null = null;
  @Input() mode: NzMenuModeType = 'vertical';
  @Output() readonly toggleSubMenu = new EventEmitter();
  @Output() readonly subMenuMouseState = new EventEmitter<boolean>();

  dir: Direction;
  private destroy$ = new Subject<void>();

  constructor(cdr: ChangeDetectorRef, directionality: Directionality) {
    this.dir = directionality.value;
    directionality.change.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.dir = directionality.value;
      cdr.detectChanges();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  setMouseState(state: boolean): void {
    if (!this.nzDisabled) {
      this.subMenuMouseState.next(state);
    }
  }
  clickTitle(): void {
    if (this.mode === 'inline' && !this.nzDisabled) {
      this.toggleSubMenu.emit();
    }
  }
}
