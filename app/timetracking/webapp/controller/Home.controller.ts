import Button from 'sap/m/Button';
import CheckBox from 'sap/m/CheckBox';
import DatePicker from 'sap/m/DatePicker';
import Dialog from 'sap/m/Dialog';
import Input from 'sap/m/Input';
import { PlanningCalendarStickyMode } from 'sap/m/library';
import MessageToast from 'sap/m/MessageToast';
import ResponsivePopover from 'sap/m/ResponsivePopover';
import Select from 'sap/m/Select';
import SinglePlanningCalendar from 'sap/m/SinglePlanningCalendar';
import Event from 'sap/ui/base/Event';
import Control from 'sap/ui/core/Control';
import UI5Date from 'sap/ui/core/date/UI5Date';
import DateFormat from 'sap/ui/core/format/DateFormat';
import Fragment from 'sap/ui/core/Fragment';
import Item from 'sap/ui/core/Item';
import { ValueState } from 'sap/ui/core/library';
import Controller from 'sap/ui/core/mvc/Controller';
import View from 'sap/ui/core/mvc/View';
import Context from 'sap/ui/model/Context';
import JSONModel from 'sap/ui/model/json/JSONModel';
import CalendarAppointment from 'sap/ui/unified/CalendarAppointment';
import { CalendarDayType } from 'sap/ui/unified/library';

/**
 * @namespace io.nimble.timetracking.controller
 */
export default class Home extends Controller {
  public sPath: string | null = null;
  private _oChosenDayData: { start: Date; end: Date } | undefined;
  private _pDetailsPopover: Promise<ResponsivePopover> | null = null;
  private _pNewAppointmentDialog: Promise<Dialog> | null = null;

  /*eslint-disable @typescript-eslint/no-empty-function*/
  public onInit(): void {
    var oModel = new JSONModel();
    oModel.setData({
      startDate: UI5Date.getInstance('2018', '6', '9'),
      appointments: [
        {
          title: 'Discussion with clients',
          text: 'Online meeting',
          type: CalendarDayType.Type08,
          icon: 'sap-icon://home',
          startDate: UI5Date.getInstance('2018', '6', '17', '15', '30'),
          endDate: UI5Date.getInstance('2018', '6', '17', '16', '30'),
        },
      ],
      supportedAppointmentItems: [
        {
          text: 'Team Meeting',
          type: CalendarDayType.Type01,
        },
        {
          text: 'Personal',
          type: CalendarDayType.Type05,
        },
        {
          text: 'Discussions',
          type: CalendarDayType.Type08,
        },
        {
          text: 'Out of office',
          type: CalendarDayType.Type09,
        },
        {
          text: 'Private meeting',
          type: CalendarDayType.Type03,
        },
      ],
    });

    this.getView().setModel(oModel);

    oModel = new JSONModel();
    oModel.setData({ allDay: false });
    this.getView().setModel(oModel, 'allDay');

    oModel = new JSONModel();

    oModel.setData({
      stickyMode: PlanningCalendarStickyMode.None,
      enableAppointmentsDragAndDrop: true,
      enableAppointmentsResize: true,
      enableAppointmentsCreate: true,
    });
    this.getView().setModel(oModel, 'settings');
  }

  public _typeFormatter(sType: string): string {
    let sTypeText = '';
    const aTypes = (this.getView().getModel() as JSONModel).getData().supportedAppointmentItems;

    for (let i = 0; i < aTypes.length; i++) {
      if (aTypes[i].type === sType) {
        sTypeText = aTypes[i].text;
      }
    }

    if (sTypeText !== '') {
      return sTypeText;
    } else {
      return sType;
    }
  }

  public handleAppointmentDrop(oEvent: Event): void {
    let oAppointment = oEvent.getParameter('appointment' as never) as CalendarAppointment,
      oStartDate = oEvent.getParameter('startDate' as never) as Date,
      oEndDate = oEvent.getParameter('endDate' as never) as Date,
      bCopy = oEvent.getParameter('copy' as never) as boolean,
      sAppointmentTitle = oAppointment.getTitle(),
      oModel = this.getView().getModel() as JSONModel,
      oNewAppointment;

    if (bCopy) {
      oNewAppointment = {
        title: sAppointmentTitle,
        icon: oAppointment.getIcon(),
        text: oAppointment.getText(),
        type: oAppointment.getType(),
        startDate: oStartDate,
        endDate: oEndDate,
      };
      oModel.getData().appointments.push(oNewAppointment);
      oModel.updateBindings(true);
    } else {
      oAppointment.setStartDate(oStartDate);
      oAppointment.setEndDate(oEndDate);
    }

    MessageToast.show(
      "Appointment with title \n'" + sAppointmentTitle + "'\n has been " + (bCopy ? 'create' : 'moved'),
    );
  }

  public handleAppointmentResize(oEvent: Event): void {
    let oAppointment = oEvent.getParameter('appointment' as never) as CalendarAppointment,
      oStartDate = oEvent.getParameter('startDate' as never) as Date,
      oEndDate = oEvent.getParameter('endDate' as never) as Date,
      sAppointmentTitle = oAppointment.getTitle();

    oAppointment.setStartDate(oStartDate);
    oAppointment.setEndDate(oEndDate);

    MessageToast.show("Appointment with title \n'" + sAppointmentTitle + "'\n has been resized");
  }

  public handleAppointmentCreateDnD(oEvent: Event): void {
    let oStartDate = oEvent.getParameter('startDate' as never) as Date,
      oEndDate = oEvent.getParameter('endDate' as never) as Date,
      sAppointmentTitle = 'New Appointment',
      oModel = this.getView().getModel() as JSONModel,
      oNewAppointment = {
        title: sAppointmentTitle,
        startDate: oStartDate,
        endDate: oEndDate,
      };

    oModel.getData().appointments.push(oNewAppointment);
    oModel.updateBindings(true);

    MessageToast.show("Appointment with title \n'" + sAppointmentTitle + "'\n has been created");
  }

  public handleViewChange(): void {
    MessageToast.show("'viewChange' event fired.");
  }

  public handleAppointmentSelect(oEvent: Event): void {
    let oAppointment = oEvent.getParameter('appointment' as never) as CalendarAppointment,
      oStartDate,
      oEndDate,
      oTrimmedStartDate,
      oTrimmedEndDate,
      bAllDate,
      oModel,
      oView = this.getView() as View;

    if (oAppointment === undefined) {
      return;
    }

    oStartDate = oAppointment.getStartDate() as Date;
    oEndDate = oAppointment.getEndDate() as Date;
    oTrimmedStartDate = UI5Date.getInstance(oStartDate);
    oTrimmedEndDate = UI5Date.getInstance(oEndDate);
    bAllDate = false;
    oModel = this.getView().getModel('allDay') as JSONModel;

    if (!oAppointment.getSelected() && this._pDetailsPopover) {
      this._pDetailsPopover.then(function (oResponsivePopover) {
        oResponsivePopover.close();
      });
      return;
    }

    this._setHoursToZero(oTrimmedStartDate);
    this._setHoursToZero(oTrimmedEndDate);

    if (oStartDate.getTime() === oTrimmedStartDate.getTime() && oEndDate.getTime() === oTrimmedEndDate.getTime()) {
      bAllDate = true;
    }

    oModel.getData().allDay = bAllDate;
    oModel.updateBindings(true);

    if (!this._pDetailsPopover) {
      this._pDetailsPopover = (
        Fragment.load({
          id: oView.getId(),
          name: 'sap.m.sample.SinglePlanningCalendar.Details',
          controller: this,
        }) as Promise<ResponsivePopover>
      ).then(function (oResponsivePopover) {
        oView.addDependent(oResponsivePopover);
        return oResponsivePopover;
      });
    }
    this._pDetailsPopover.then(function (oResponsivePopover) {
      oResponsivePopover.setBindingContext(oAppointment.getBindingContext() as Context);
      oResponsivePopover.openBy(oAppointment);
    });
  }

  public handleMoreLinkPress(oEvent: Event): void {
    let oDate = oEvent.getParameter('date' as never) as Date,
      oSinglePlanningCalendar = this.getView().byId('SPC1') as SinglePlanningCalendar;

    oSinglePlanningCalendar.setSelectedView(oSinglePlanningCalendar.getViews()[2]); // DayView

    (this.getView().getModel() as JSONModel).setData({ startDate: oDate }, true);
  }

  public handleEditButton(): void {
    // The sap.m.Popover has to be closed before the sap.m.Dialog gets opened
    let oDetailsPopover = this.byId('detailsPopover') as ResponsivePopover;
    oDetailsPopover.close();
    this.sPath = oDetailsPopover.getBindingContext().getPath();
    this._arrangeDialogFragment('Edit appointment');
  }

  public handlePopoverDeleteButton(): void {
    let oModel = this.getView().getModel() as JSONModel,
      oAppointments = oModel.getData().appointments,
      oDetailsPopover = this.byId('detailsPopover') as ResponsivePopover,
      oAppointment = oDetailsPopover._getBindingContext().getObject();

    oDetailsPopover.close();

    oAppointments.splice(oAppointments.indexOf(oAppointment), 1);
    oModel.updateBindings(true);
  }

  private _arrangeDialogFragment(sTitle: string): void {
    let oView = this.getView() as View;

    if (!this._pNewAppointmentDialog) {
      this._pNewAppointmentDialog = (
        Fragment.load({
          id: oView.getId(),
          name: 'sap.m.sample.SinglePlanningCalendar.Modify',
          controller: this,
        }) as Promise<Dialog>
      ).then(function (oNewAppointmentDialog) {
        oView.addDependent(oNewAppointmentDialog);
        return oNewAppointmentDialog;
      });
    }

    this._pNewAppointmentDialog.then(
      function (oNewAppointmentDialog: Dialog) {
        this._arrangeDialog(sTitle, oNewAppointmentDialog);
      }.bind(this),
    );
  }

  private _arrangeDialog(sTitle: string, oNewAppointmentDialog: Dialog): void {
    this._setValuesToDialogContent(oNewAppointmentDialog);
    oNewAppointmentDialog.setTitle(sTitle);
    oNewAppointmentDialog.open();
  }

  private _setValuesToDialogContent(oNewAppointmentDialog: any): void {
    let oAllDayAppointment = this.byId('allDay') as CalendarAppointment,
      sStartDatePickerID = oAllDayAppointment.getSelected() ? 'DPStartDate' : 'DTPStartDate',
      sEndDatePickerID = oAllDayAppointment.getSelected() ? 'DPEndDate' : 'DTPEndDate',
      oTitleControl = this.byId('appTitle') as Input,
      oTextControl = this.byId('moreInfo') as Input,
      oTypeControl = this.byId('appType') as Select,
      oStartDateControl = this.byId(sStartDatePickerID) as DatePicker,
      oEndDateControl = this.byId(sEndDatePickerID) as DatePicker,
      oEmptyError = { errorState: false, errorMessage: '' },
      oContext,
      oContextObject,
      oSPCStartDate,
      sTitle,
      sText,
      oStartDate,
      oEndDate,
      sType;

    if (this.sPath) {
      oContext = (this.byId('detailsPopover') as ResponsivePopover).getBindingContext() as Context;
      oContextObject = oContext.getObject() as {
        title: string;
        text: string;
        startDate: Date;
        endDate: Date;
        type: string;
      };
      sTitle = oContextObject.title;
      sText = oContextObject.text;
      oStartDate = oContextObject.startDate;
      oEndDate = oContextObject.endDate;
      sType = oContextObject.type;
    } else {
      sTitle = '';
      sText = '';
      if (this._oChosenDayData) {
        oStartDate = this._oChosenDayData.start;
        oEndDate = this._oChosenDayData.end;

        delete this._oChosenDayData;
      } else {
        oSPCStartDate = (this.getView().byId('SPC1') as SinglePlanningCalendar).getStartDate();
        oStartDate = UI5Date.getInstance(oSPCStartDate);
        oStartDate.setHours(this._getDefaultAppointmentStartHour());
        oEndDate = UI5Date.getInstance(oSPCStartDate);
        oEndDate.setHours(this._getDefaultAppointmentEndHour());
      }
      oAllDayAppointment.setSelected(false);
      sType = 'Type01';
    }

    oTitleControl.setValue(sTitle);
    oTextControl.setValue(sText);
    oStartDateControl.setDateValue(oStartDate);
    oEndDateControl.setDateValue(oEndDate);
    oTypeControl.setSelectedKey(sType);
    this._setDateValueState(oStartDateControl, oEmptyError);
    this._setDateValueState(oEndDateControl, oEmptyError);
    this.updateButtonEnabledState(oStartDateControl, oEndDateControl, oNewAppointmentDialog.getBeginButton());
  }

  public handleDialogOkButton(): void {
    let bAllDayAppointment = (this.byId('allDay') as CheckBox).getSelected(),
      sStartDate = bAllDayAppointment ? 'DPStartDate' : 'DTPStartDate',
      sEndDate = bAllDayAppointment ? 'DPEndDate' : 'DTPEndDate',
      sTitle = (this.byId('appTitle') as Input).getValue(),
      sText = (this.byId('moreInfo') as Input).getValue(),
      sType = ((this.byId('appType') as Select).getSelectedItem() as Item).getKey(),
      oStartDate = (this.byId(sStartDate) as DatePicker).getDateValue(),
      oEndDate = (this.byId(sEndDate) as DatePicker).getDateValue(),
      oModel = this.getView().getModel() as JSONModel,
      sAppointmentPath;

    if (
      (this.byId(sStartDate) as DatePicker).getValueState() !== ValueState.Error &&
      (this.byId(sEndDate) as DatePicker).getValueState() !== ValueState.Error
    ) {
      if (this.sPath) {
        sAppointmentPath = this.sPath;
        oModel.setProperty(sAppointmentPath + '/title', sTitle);
        oModel.setProperty(sAppointmentPath + '/text', sText);
        oModel.setProperty(sAppointmentPath + '/type', sType);
        oModel.setProperty(sAppointmentPath + '/startDate', oStartDate);
        oModel.setProperty(sAppointmentPath + '/endDate', oEndDate);
      } else {
        oModel.getData().appointments.push({
          title: sTitle,
          text: sText,
          type: sType,
          startDate: oStartDate,
          endDate: oEndDate,
        });
      }

      oModel.updateBindings(true);

      (this.byId('modifyDialog') as Dialog).close();
    }
  }

  public formatDate(oDate: Date): string | undefined {
    if (oDate) {
      let iHours = oDate.getHours(),
        iMinutes = oDate.getMinutes(),
        iSeconds = oDate.getSeconds();

      if (iHours !== 0 || iMinutes !== 0 || iSeconds !== 0) {
        return DateFormat.getDateTimeInstance({ style: 'medium' }).format(oDate);
      } else {
        return DateFormat.getDateInstance({ style: 'medium' }).format(oDate);
      }
    }
  }

  public handleDialogCancelButton(): void {
    this.sPath = null;
    (this.byId('modifyDialog') as Dialog).close();
  }

  public handleCheckBoxSelect(oEvent: Event): void {
    let bSelected = oEvent.getSource().getSelected(),
      sStartDatePickerID = bSelected ? 'DTPStartDate' : 'DPStartDate',
      sEndDatePickerID = bSelected ? 'DTPEndDate' : 'DPEndDate',
      oOldStartDate = (this.byId(sStartDatePickerID) as DatePicker).getDateValue(),
      oNewStartDate = UI5Date.getInstance(oOldStartDate),
      oOldEndDate = (this.byId(sEndDatePickerID) as DatePicker).getDateValue(),
      oNewEndDate = UI5Date.getInstance(oOldEndDate);

    if (!bSelected) {
      oNewStartDate.setHours(this._getDefaultAppointmentStartHour());
      oNewEndDate.setHours(this._getDefaultAppointmentEndHour());
    } else {
      this._setHoursToZero(oNewStartDate);
      this._setHoursToZero(oNewEndDate);
    }

    sStartDatePickerID = !bSelected ? 'DTPStartDate' : 'DPStartDate';
    sEndDatePickerID = !bSelected ? 'DTPEndDate' : 'DPEndDate';
    (this.byId(sStartDatePickerID) as DatePicker).setDateValue(oNewStartDate);
    (this.byId(sEndDatePickerID) as DatePicker).setDateValue(oNewEndDate);
  }

  private _getDefaultAppointmentStartHour(): number {
    return 9;
  }

  private _getDefaultAppointmentEndHour(): number {
    return 10;
  }

  private _setHoursToZero(oDate: Date): void {
    oDate.setHours(0, 0, 0, 0);
  }

  public handleAppointmentCreate(): void {
    this._createInitialDialogValues((this.getView().byId('SPC1') as SinglePlanningCalendar).getStartDate());
  }

  public handleHeaderDateSelect(oEvent: Event): void {
    this._createInitialDialogValues(oEvent.getParameter('date' as never));
  }

  private _createInitialDialogValues(oDate: Date): void {
    let oStartDate = UI5Date.getInstance(oDate),
      oEndDate = UI5Date.getInstance(oStartDate);

    oStartDate.setHours(this._getDefaultAppointmentStartHour());
    oEndDate.setHours(this._getDefaultAppointmentEndHour());
    this._oChosenDayData = { start: oStartDate, end: oEndDate };
    this.sPath = null;

    this._arrangeDialogFragment('Create appointment');
  }

  public handleStartDateChange(oEvent: Event): void {
    let oStartDate = oEvent.getParameter('date' as never) as UI5Date;
    MessageToast.show("'startDateChange' event fired.\n\nNew start date is " + oStartDate.toString());
  }

  public updateButtonEnabledState(
    oDateTimePickerStart: DatePicker,
    oDateTimePickerEnd: DatePicker,
    oButton: Button,
  ): void {
    let bEnabled =
      oDateTimePickerStart.getValueState() !== ValueState.Error &&
      oDateTimePickerStart.getValue() !== '' &&
      oDateTimePickerEnd.getValue() !== '' &&
      oDateTimePickerEnd.getValueState() !== ValueState.Error;

    oButton.setEnabled(bEnabled);
  }

  public handleDateTimePickerChange(oEvent: Event): void {
    let oDateTimePickerStart = this.byId('DTPStartDate') as DatePicker,
      oDateTimePickerEnd = this.byId('DTPEndDate') as DatePicker,
      oStartDate = oDateTimePickerStart.getDateValue() as UI5Date,
      oEndDate = oDateTimePickerEnd.getDateValue() as UI5Date,
      oErrorState = { errorState: false, errorMessage: '' };

    if (!oStartDate) {
      oErrorState.errorState = true;
      oErrorState.errorMessage = 'Please pick a date';
      this._setDateValueState(oDateTimePickerStart, oErrorState);
    } else if (!oEndDate) {
      oErrorState.errorState = true;
      oErrorState.errorMessage = 'Please pick a date';
      this._setDateValueState(oDateTimePickerEnd, oErrorState);
    } else if (!oEvent.getParameter('valid' as never)) {
      oErrorState.errorState = true;
      oErrorState.errorMessage = 'Invalid date';
      if (oEvent.getSource() === oDateTimePickerStart) {
        this._setDateValueState(oDateTimePickerStart, oErrorState);
      } else {
        this._setDateValueState(oDateTimePickerEnd, oErrorState);
      }
    } else if (oStartDate && oEndDate && oEndDate.getTime() <= oStartDate.getTime()) {
      oErrorState.errorState = true;
      oErrorState.errorMessage = 'Start date should be before End date';
      this._setDateValueState(oDateTimePickerStart, oErrorState);
      this._setDateValueState(oDateTimePickerEnd, oErrorState);
    } else {
      this._setDateValueState(oDateTimePickerStart, oErrorState);
      this._setDateValueState(oDateTimePickerEnd, oErrorState);
    }

    this.updateButtonEnabledState(
      oDateTimePickerStart,
      oDateTimePickerEnd,
      (this.byId('modifyDialog') as Dialog).getBeginButton(),
    );
  }

  public handleDatePickerChange(): void {
    let oDatePickerStart = this.byId('DPStartDate') as DatePicker,
      oDatePickerEnd = this.byId('DPEndDate') as DatePicker,
      oStartDate = oDatePickerStart.getDateValue() as UI5Date,
      oEndDate = oDatePickerEnd.getDateValue() as UI5Date,
      bEndDateBiggerThanStartDate = oEndDate.getTime() < oStartDate.getTime(),
      oErrorState = { errorState: false, errorMessage: '' };

    if (oStartDate && oEndDate && bEndDateBiggerThanStartDate) {
      oErrorState.errorState = true;
      oErrorState.errorMessage = 'Start date should be before End date';
    }
    this._setDateValueState(oDatePickerStart, oErrorState);
    this._setDateValueState(oDatePickerEnd, oErrorState);
    this.updateButtonEnabledState(
      oDatePickerStart,
      oDatePickerEnd,
      (this.byId('modifyDialog') as Dialog).getBeginButton(),
    );
  }

  private _setDateValueState(oPicker: DatePicker, oErrorState: { errorState: boolean; errorMessage: string }): void {
    if (oErrorState.errorState) {
      oPicker.setValueState(ValueState.Error);
      oPicker.setValueStateText(oErrorState.errorMessage);
    } else {
      oPicker.setValueState(ValueState.None);
    }
  }
}
