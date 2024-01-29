import { publish, MessageContext } from "lightning/messageService";
import getBoats from "@salesforce/apex/BoatDataService.getBoats";
import updateBoatList from "@salesforce/apex/BoatDataService.updateBoatList";
import { api, wire , LightningElement, track} from "lwc";
import {refreshApex} from '@salesforce/apex';
import BOATMC from '@salesforce/messageChannel/BoatMessageChannel__c';
import { ShowToastEvent } from 'lightning/platformShowToastEvent'


const SUCCESS_TITLE = 'Success';
const MESSAGE_SHIP_IT     = 'Ship it!';
const SUCCESS_VARIANT     = 'success';
const ERROR_TITLE   = 'Error';
const ERROR_VARIANT = 'error';
export default class BoatSearchResults extends LightningElement {
    @api
    selectedBoatId;
    columns = [
        {label: 'Name', fieldName: 'Name', editable : true},
        {label: 'Length', fieldName: 'Length__c', type:'number'},
        {label: 'Price', fieldName: 'Price__c', type:'currency'},
        {label: 'Description', fieldName: 'Description__c'}

    ];
    boatTypeId = '';
    @track
    boats;
    isLoading = false;
    @track
    draftValues = [];
  
  @wire(MessageContext)
  messageContext;
  
  @wire(getBoats, {boatTypeId : '$boatTypeId'})
  wiredBoats(result) {
    this.boats = result;
  }
  
  // public function that updates the existing boatTypeId property
  // uses notifyLoading
  @api
  searchBoats(boatTypeId) { 
    this.isLoading = true;
    this.notifyLoading(this.isLoading);
    this.boatTypeId = boatTypeId;
  }
  
  // this public function must refresh the boats asynchronously
  // uses notifyLoading
  @api
  async refresh() { 
    this.isLoading = true;
    this.notifyLoading(this.isLoading);
    await refreshApex(this.boats);
    this.isLoading = false;
    this.notifyLoading(this.isLoading);
  }
  
  // this function must update selectedBoatId and call sendMessageService
  updateSelectedTile(event){
    const boatId = event.detail.boatId;
    this.selectedBoatId = boatId;
    this.sendMessageService(selectedBoatId);
  }

  get listIsNotEmpty() {
    return this.contacts && Array.isArray(this.contacts.data) && this.contacts.data.length > 0;
  }
  
  // Publishes the selected boat Id on the BoatMC.
  sendMessageService(boatId) { 
    const payload = { recordId: boatId};

    publish(this.messageContext, BOATMC, payload);
  }
  
  // The handleSave method must save the changes in the Boat Editor
  // passing the updated fields from draftValues to the 
  // Apex method updateBoatList(Object data).
  // Show a toast message with the title
  // clear lightning-datatable draft values
  handleSave(event) {
    this.notifyLoading(this.isLoading);
    const updatedFields = event.detail.draftValues;
    // Update the records via Apex
    updateBoatList({data: updatedFields})
    .then(() => {
        const toastSuccess = new ShowToastEvent({
            title: SUCCESS_TITLE,
            variant: SUCCESS_VARIANT,
            message : MESSAGE_SHIP_IT
        })
        this.dispatchEvent(toastSuccess)
        this.draftValues = [];
        return this.refresh();
    })
    .catch(error => {
        const toastError = new showToastEvent({
            title: ERROR_TITLE,
            variant: ERROR_VARIANT,
            message : error.message
        })
        this.dispatchEvent(toastError)
    })
    .finally(() => {
        this.refresh();
    });
  }
  // Check the current value of isLoading before dispatching the doneloading or loading custom event
  notifyLoading(isLoading) { 
    if(isLoading == true){
        this.dispatchEvent(new CustomEvent('loading'))
    }
    else{
        this.dispatchEvent(new CustomEvent('doneloading'));
    }
  }
}
