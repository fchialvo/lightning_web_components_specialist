import { LightningElement } from 'lwc';
import getBoats from '@salesforce/apex/BoatDataService.getBoats';

export default class BoatSearchResults extends LightningElement {
    isLoading;
    boats = [];
    searchBoats(boatTypeId){
        getBoats(boatTypeId);
    }
}