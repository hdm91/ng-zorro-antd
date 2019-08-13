import { registerLocaleData } from '@angular/common';
import zh from '@angular/common/locales/zh';

import { fakeAsync, inject, TestBed } from '@angular/core/testing';

import { DateTableComponent } from '../../calendar/date-table.component';
import { CandyDate } from '../../core';
import { DateHelperService } from '../../i18n/date-helper.service';
import { NzI18nService } from '../../i18n/nz-i18n.service';
import { AbstractPickerComponent } from '../abstract-picker.component';
import { MonthTableComponent } from './../../calendar/month-table.component';
import { CalendarHeaderComponent } from './calendar/calendar-header.component';
import { TodayButtonComponent } from './calendar/today-button.component';
import { LibPackerModule } from './lib-packer.module';
import { DateRangePopupComponent } from './popups/date-range-popup.component';
import { YearPanelComponent } from './year/year-panel.component';

registerLocaleData(zh);

describe('Coverage supplements', () => {
  let componentInstance: any; // tslint:disable-line:no-any
  let dateHelper: DateHelperService;
  let i18n: NzI18nService;

  beforeEach(fakeAsync(() => {
    TestBed.configureTestingModule({
      imports: [LibPackerModule]
    });

    TestBed.compileComponents();
  }));

  beforeEach(inject(
    [NzI18nService, DateHelperService],
    (i18nService: NzI18nService, dateHelperService: DateHelperService) => {
      dateHelper = dateHelperService;
      i18n = i18nService;
    }
  ));

  describe('CalendarHeader', () => {
    beforeEach(() => {
      componentInstance = new CalendarHeaderComponent();
    });

    it('should not render if no relative changes', () => {
      // Currently: value/showTimePicker/panelMode will trigger render()
      spyOn(componentInstance, 'render');
      componentInstance.ngOnChanges({});
      expect(componentInstance.render).not.toHaveBeenCalled();
    });

    it('should step into yearToMonth branch', () => {
      const testDate = new CandyDate();
      componentInstance.yearToMonth = true;
      spyOn(componentInstance, 'changePanel');
      componentInstance.onChooseYear(testDate);
      expect(componentInstance.changePanel).toHaveBeenCalledWith('month', testDate);
    });

    it('cover branches of createYearMonthDaySelectors', () => {
      componentInstance.value = new CandyDate();
      componentInstance.locale = {
        monthBeforeYear: true,
        monthFormat: 'yyyy-MM'
      };
      componentInstance.showTimePicker = true;
      spyOn(componentInstance, 'changePanel');
      spyOn(componentInstance, 'changeToMonthPanel');
      spyOn(componentInstance, 'formatDateTime');
      const result = componentInstance.createYearMonthDaySelectors();

      // should support locale.monthBeforeYear
      expect(result[0].className).toContain('month-select'); // "month" tobe the first place

      // should not fire onClick of year/month selector when showTimePicker=true
      result[0].onClick(); // month
      result[2].onClick(); // year
      expect(componentInstance.changePanel).not.toHaveBeenCalled();
      expect(componentInstance.changeToMonthPanel).not.toHaveBeenCalled();

      // should support locale.monthFormat
      expect(componentInstance.formatDateTime).toHaveBeenCalledWith(componentInstance.locale.monthFormat);
    });
  }); // /CalendarHeader

  describe('TodayButton', () => {
    beforeEach(() => {
      componentInstance = new TodayButtonComponent();
    });

    it('should cover untouched branches', () => {
      componentInstance.disabledDate = () => true;
      componentInstance.ngOnChanges({ disabledDate: {} }); // Fake mock
      expect(componentInstance.isDisabled).toBeTruthy();
    });
  }); // /TodayButton

  // TODO: Unit test of date-table and month-table
  describe('DateTable', () => {
    beforeEach(() => {
      componentInstance = new DateTableComponent(dateHelper, i18n);
    });

    it('should cover untouched branches', () => {
      componentInstance.value = new CandyDate('2018-11-11');
      componentInstance.showWeek = true;
      const weekRows = componentInstance.makeWeekRows();
      expect(weekRows.length > 0).toBeTruthy();
    });
  }); // /DateTable

  describe('MonthTable', () => {
    beforeEach(() => {
      componentInstance = new MonthTableComponent();
    });

    it('should cover untouched branches', () => {
      componentInstance.value = new CandyDate();
      spyOn(componentInstance, 'render');
      componentInstance.ngOnChanges({ disabledDate: true }); // Fake
      expect(componentInstance.render).toHaveBeenCalled();
    });
  }); // /MonthTable

  describe('DateRangePopup', () => {
    beforeEach(() => {
      componentInstance = new DateRangePopupComponent();
    });

    it('should cover untouched branches', () => {
      // Reverse onDayHover
      const start = new CandyDate('2018-11-11');
      const end = new CandyDate('2018-12-12');
      componentInstance.isRange = true;
      componentInstance.selectedValue = [end];
      componentInstance.onDayHover(start);
      expect(componentInstance.hoverValue[0].getDate()).toBe(11);
      expect(componentInstance.hoverValue[1].getDate()).toBe(12);

      // overrideHms
      expect(componentInstance.overrideHms(null, null)).toBe(null);

      // isValidRange
      expect(componentInstance.isValidRange(new CandyDate())).toBeFalsy();

      // sortRangeValue
      componentInstance.selectedValue = [end, start];
      componentInstance.sortRangeValue();
      expect(componentInstance.selectedValue[0].getDate()).toBe(11);
    });
  }); // /DateRangePopup

  describe('AbstractPicker', () => {
    beforeEach(() => {
      const fakeCdr = { markForCheck: () => void 0 };
      componentInstance = new (AbstractPickerComponent as any)(i18n, fakeCdr); // tslint:disable-line:no-any
    });

    it('should cover untouched branches', () => {
      // onOpenChange
      const emit = spyOn(componentInstance.nzOnOpenChange, 'emit');
      componentInstance.onOpenChange(true);
      expect(emit).toHaveBeenCalled();

      // setDisabledState
      componentInstance.setDisabledState(true);
      expect(componentInstance.nzDisabled).toBeTruthy();
    });
  }); // /AbstractPicker

  describe('YearPanel', () => {
    beforeEach(() => {
      componentInstance = new YearPanelComponent();
    });

    it('should cover untouched branches', () => {
      // makePanelYears
      spyOn(componentInstance, 'previousDecade');
      spyOn(componentInstance, 'nextDecade');
      componentInstance.value = new CandyDate('2018-11-11');
      const years = componentInstance.makePanelYears();
      const lastCell = years[0][0];
      const nextCell = years[years.length - 1][years[years.length - 1].length - 1];
      lastCell.onClick();
      nextCell.onClick();
      expect(componentInstance.previousDecade).toHaveBeenCalled();
      expect(componentInstance.nextDecade).toHaveBeenCalled();

      // ngOnChanges
      spyOn(componentInstance, 'render');
      componentInstance.ngOnChanges({}); // Fake
      expect(componentInstance.render).not.toHaveBeenCalled();
    });

    it('should cover render', () => {
      // cover render
      componentInstance.value = null;
      spyOn(componentInstance, 'makePanelYears');
      expect(componentInstance.makePanelYears).not.toHaveBeenCalled();
    });
  }); // /YearPanel
});
