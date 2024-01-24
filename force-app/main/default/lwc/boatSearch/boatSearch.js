import { api } from "lwc";
export default class BoatSearch extends LightningElement {
    @api
    isLoading = false;
    
    // Handles loading event
    handleLoading() { 
        this.isLoading = true;
    }
    
    // Handles done loading event
    handleDoneLoading() {
        this.isLoading = false;
     }
    
    // Handles search boat event
    // This custom event comes from the form
    searchBoats(event) { 
        searchBoats(event.detail.Id)
    }
    
    createNewBoat() { }
  }