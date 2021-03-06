import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Dictionery } from '../../providers/dictionery';
import { HistoryProvider } from '../../providers/historyProvider';
import { ToastProvider } from '../../providers/toast-provider';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  private lastSaved: any;
  private dic: any;
  private wordlist: any;
  private historyMeanListObj: any;
  private historyListObj: any;
  private lastSavedMeans: any;

  private selecteMeanList: any;
  constructor(public navCtrl: NavController,
    private history: HistoryProvider,
    private dicServise: Dictionery,
    private toast: ToastProvider) {

    this.dic = {}
    this.dic.find = '';
    this.historyListObj = {}
    this.selecteMeanList = [];
    this.lastSavedMeans = [];
    this.lastSaved = [];
    this.init();
  }
  private historyLoad() {
    //Todo::To convert to promise
    this.history.load(this.history.historyKey, []).then(historyArr => {
      this.historyListObj = this.history.toObject(historyArr);
    })
  }
  public init() {
    console.log('mad_msg__dictionery start loading-------------');
    this.dicServise.all().then((data) => {
      this.wordlist = data;
      console.log('mad_msg__dictionery loaded-------------');
      
    });
    // setTimeout(this.loadLastSave(), 2000)
  }

  protected browesWord(word: string): any {
    if (word && word.trim() != '') {
      return this.wordlist[word];
    }
  }

  emptyWordList() {
    this.selecteMeanList = [];
  }

  // added to the history
  wordSelected(mean: string, isRemove: boolean) {
    let word = this.history.wordClean(this.dic.find);
    word = this.history.wordClean(word);
    if (isRemove) {
      this.clear(word, mean, isRemove)
    }
    else {
      this.history.add(word, mean);
    }

  }

  recordTypeWord(word: string) {
    this.history.saveFinderWords(word);
  }

  loadLastSave() {
    let historyKeyArr = []; 
    this.lastSaved = [];
    this.lastSavedMeans = [];
    this.history.getLast3Word().then(historyArr =>{
      if(historyArr){
        historyKeyArr = Object.keys(historyArr)
        for (var index = historyKeyArr.length-1; (historyKeyArr.length-4) < index; index--) {
          let word = historyArr[historyKeyArr[index]]
          this.lastSaved.push(word) 
          this.lastSavedMeans[word] = this.browesWord(word);
        } 
      }
    });
  }

  finderClear(ev) {
    this.recordTypeWord(this.dic.find)
    this.dic.find = "";
    this.emptyWordList();
    this.loadLastSave()
  }
  finderClear2(ev) {
    this.dic.find = "";
    this.emptyWordList();
  }

  /*newFind(word:string){
    let newWordlistArr = Object.keys(this.wordlist);
    this.wordlist = newWordlistArr.filter((item) => {
      return (item.toLowerCase().indexOf(word.toLowerCase()) > -1);
    });
    console.log('mad_msg__this.wordlist',this.wordlist);
  }*/

  findword(ev):void {
    let word = this.history.wordClean(this.dic.find);
    if (word) {
      let spaceindex = word.indexOf(' ')
      if (spaceindex > -1) {
        let wordlength = word.length;
        let temp = word.substr(spaceindex + 1, wordlength - spaceindex);
        this.finderClear(ev);
        this.dic.find = temp;
      }
      // load the history with mean
      this.history.load(word, []).then(meanArr => {
        this.historyLoad()
        this.historyMeanListObj = this.history.toObject(meanArr)
        this.selecteMeanList = this.browesWord(word);
      });
    }
    // empty resutle
    else {
      this.emptyWordList();
    }
  }

  clear(word: string, mean: string, isRemove) {
    this.history.clear(word, mean, isRemove).then(response => {
      console.log('mad_msg__deleted', response);
    });
  }

  isInHistory(word: string, mean: string) {
    return (this.historyMeanListObj[mean] == mean) && (this.historyListObj[word] == word)
  }

  // Added to local storage needupdate 
  needToUpdate(ev) {
    let word = this.history.wordClean(this.dic.find);
    this.dicServise.needToBeUpdateSave(word);
    this.finderClear(ev);
    this.toast.show('Word will updated');;
  }
 
}
