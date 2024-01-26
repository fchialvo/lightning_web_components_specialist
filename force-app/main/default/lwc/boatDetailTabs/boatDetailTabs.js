import { LightningElement , wire } from "lwc";
// Custom Labels Imports
import labelDetails from "@salesforce/label/c.Details";
import labelReviews from "@salesforce/label/c.Reviews";
import labelAddReview from "@salesforce/label/c.Add_Review"
import labelFullDetails from "@salesforce/label/c.Full_Details"
import labelPleaseSelectABoat from "@salesforce/label/c.Please_select_a_boat"

// Boat__c Schema Imports
import BOAT_ID_FIELD from '@salesforce/schema/Boat__c.Id'
import BOAT_NAME_FIELD from '@salesforce/schema/Boat__c.Name'

import { getRecord } from "lightning/uiRecordApi";
import { getFieldValue } from "lightning/uiRecordApi";

import BOATMC from '@salesforce/messageChannel/boatMessageChannel__c'
import {
    subscribe,
    APPLICATION_SCOPE,
    MessageContext,
} from "lightning/messageService";


const BOAT_FIELDS = [BOAT_ID_FIELD, BOAT_NAME_FIELD];
export default class BoatDetailTabs extends NavigationMixin(LightningElement) {
  @wire(MessageContext)
  messageContext;
  boatId;

  @wire(getRecord, { recordId: "$boatId", fields: BOAT_FIELDS })
  wiredRecord;
  label = {
    labelDetails,
    labelReviews,
    labelAddReview,
    labelFullDetails,
    labelPleaseSelectABoat,
  };
  
  // Decide when to show or hide the icon
  // returns 'utility:anchor' or null
  get detailsTabIconName() { 
    return this.wiredRecord ? 'utility:anchor' : null;
  }
  
  // Utilize getFieldValue to extract the boat name from the record wire
  get boatName() {
    return getFieldValue(this.wiredRecord, BOAT_NAME_FIELD)
  }
  
  // Private
  subscription = null;
  
  // Subscribe to the message channel
  subscribeMC() {
    // local boatId must receive the recordId from the message
    if (this.subscription || this.boatId) {
        return;
      }
      this.subscription = subscribe(
        this.messageContext,
        BOATMC,
        (message) => this.boatId = message.recordId,
        { scope: APPLICATION_SCOPE },
      );
  }
  
  // Calls subscribeMC()
  connectedCallback() { 
    this.subscribeMC();
  }
  
  // Navigates to record page
    navigateToRecordViewPage(event) { 
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: this.boatId,
                actionName: 'view',
            },
        });
    }
  
  // Navigates back to the review list, and refreshes reviews component
    handleReviewCreated() { 
      this.template.querySelector('lightning-tabset').activeTabValue = 'reviews';
      this.template.querySelector('c-boat-reviews').refresh();
    }

}
