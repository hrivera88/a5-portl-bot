import {
  Component,
  OnInit,
  Renderer2,
  ViewChild,
  ElementRef
} from "@angular/core";
import {
  trigger,
  state,
  style,
  transition,
  useAnimation
} from "@angular/animations";
import { bounceInAnimation } from "../animations";
import {
  faComment,
  faGrin,
  faArrowAltCircleLeft,
  faTimesCircle,
  faArrowRight
} from "@fortawesome/free-solid-svg-icons";
import { Message } from "./message";
import { Option } from "./option";
import * as AWS from "aws-sdk";
import * as _ from "lodash";
import { SendMailService } from "../send-mail.service";

@Component({
  selector: "a5-chat-window",
  templateUrl: "./a5-chat-window.component.html",
  styleUrls: ["./a5-chat-window.component.css"],
  animations: [
    trigger("bounceMenu", [
      state("botResponse", style({})),
      state("button", style({})),
      transition("void => *", [
        useAnimation(bounceInAnimation, {
          params: {
            duration: "2s",
            delay: "0ms"
          }
        })
      ])
    ])
  ],
  providers: [SendMailService]
})
export class A5ChatWindowComponent implements OnInit {
  @ViewChild("botMessageInput")
  botMessageInput: ElementRef;
  lexRuntime: any;
  lexUserID = "Halbot" + Date.now();
  botOptionsTitle: string;
  botMenuOptions: Option[] = [];
  faComment = faComment;
  faTimesCircle = faTimesCircle;
  faArrowAltCircleLeft = faArrowAltCircleLeft;
  faGrin = faGrin;
  faArrowRight = faArrowRight;
  userMessageInput: string;
  showMainMenuOptions = true;
  showMainMenuButton = false;
  showBotOptions = false;
  messages: Message[] = [];
  lottieConfig: Object;
  notMobileScreen = true;
  bounceMenu: string;
  emojiPickerShown = false;
  responseCards: any = [];
  currentResponseCardPosition = undefined;
  multipleCards = false;
  lastResponseCard = false;
  botOptionsImg = undefined;
  changingTheme = false;
  currentTheme = "portl";
  showAlivePayModal = false;
  botLeadEmailMsg = {
    servicesChosen: "",
    email: "",
    serviceDetails: ""
  };
  customEmojis = [
    {
      name: "Computer Guy",
      short_names: ["computer_guy"],
      text: "",
      emoticons: [],
      imageUrl: "../../assets/img/cc-computer-guy.png"
    },
    {
      name: "Computer Girl",
      short_names: ["computer_girl"],
      text: "",
      emoticons: [],
      imageUrl: "../../assets/img/cc-computer-girl.png"
    },
    {
      name: "Money",
      short_names: ["cc_money"],
      text: "",
      emoticons: [],
      keywords: ["cc_money"],
      imageUrl: "../../assets/img/cc-money.png"
    },
    {
      name: "Phone Hand",
      short_names: ["phone_hand"],
      text: "",
      emoticons: [],
      keywords: ["phone_hand"],
      imageUrl: "../../assets/img/cc-phone-hand.png"
    },
    {
      name: "Phone",
      short_names: ["cc_phone"],
      text: "",
      emoticons: [],
      keywords: ["cc_phone"],
      imageUrl: "../../assets/img/cc-phone.png"
    },
    {
      name: "Repair",
      short_names: ["cc_repair"],
      text: "",
      emoticons: [],
      keywords: ["cc_repair"],
      imageUrl: "../../assets/img/cc-repair.png"
    },
    {
      name: "TV",
      short_names: ["cc_tv"],
      text: "",
      emoticons: [],
      keywords: ["cc_tv"],
      imageUrl: "../../assets/img/cc-tv.png"
    }
  ];
  emojiExcludedCategories = [
    "recent",
    "people",
    "nature",
    "foods",
    "activity",
    "places",
    "objects",
    "symbols",
    "flags",
    "search"
  ];

  constructor(
    private sendMailService: SendMailService,
    private renderer: Renderer2
  ) {
    AWS.config.region = "us-east-1";
    AWS.config.credentials = new AWS.CognitoIdentityCredentials({
      IdentityPoolId: "us-east-1:21ece9e8-d2f1-4d74-9e3b-dbf9acd25e06"
    });
    this.lexRuntime = new AWS.LexRuntime();
  }

  ngOnInit() {
    this.sendTextMessageToBot("menu", null);
    console.log(screen.width);
    if (screen.width < 768) {
      this.notMobileScreen = false;
    }
  }

  toggleEmojiPicker() {
    this.emojiPickerShown = !this.emojiPickerShown;
  }

  selectedEmoji(event: any) {
    let evt = event;
    console.log(event);
    console.log(this.userMessageInput);
    console.log(this.botMessageInput);
    if (evt.emoji.custom) {
      let customEmojiElem = this.renderer.createElement("img");
      this.renderer.addClass(customEmojiElem, "emojiImg");
      this.renderer.setAttribute(customEmojiElem, "src", evt.emoji.imageUrl);
      this.renderer.appendChild(
        this.botMessageInput.nativeElement,
        customEmojiElem
      );
    } else if (evt.emoji.native) {
      let nativeSpanElem = this.renderer.createElement("span");
      let nativeParaElem = this.renderer.createElement("p");
      let emoText = this.renderer.createText(evt.emoji.native);
      this.renderer.appendChild(nativeSpanElem, emoText);
      this.renderer.appendChild(
        this.botMessageInput.nativeElement,
        nativeSpanElem
      );
      this.renderer.appendChild(
        this.botMessageInput.nativeElement,
        nativeParaElem
      );
    }
    this.toggleEmojiPicker();
  }

  sendMail(servicesChosen, email, serviceDetails) {
    this.botLeadEmailMsg = {
      servicesChosen: servicesChosen,
      email: email,
      serviceDetails: serviceDetails
    };
    this.sendMailService.sendMail(this.botLeadEmailMsg).subscribe(result => {
      console.log(result);
    });
  }

  showResponse(isUserMessage: boolean, message: string) {
    // Check whether the User to show a response from the User or Bot
    if (isUserMessage) {
      let response: Message = {
        userMessage: true,
        name: "",
        message: message
      };
      //Add User's response to Messages UI
      this.messages.unshift(response);
    } else {
      let response: Message = {
        userMessage: false,
        name: "",
        message: message
      };
      //Add Bot's response to Messages UI
      this.messages.unshift(response);
    }
  }

  loopThroughBotResponseCardButtons(responseCardButtons) {
    _.map(responseCardButtons, opt => {
      this.botMenuOptions.push(opt);
    });
  }

  checkBotIntent(botResponse) {
    console.log(botResponse);
    if (botResponse.intentName === "NewCustomer") {
      let servicesNeeded = botResponse.slots.serviceOptions;
      let email = botResponse.slots.email;
      let serviceDetails = botResponse.slots.serviceDetails;
      console.log(botResponse.slots);
      this.sendMail(servicesNeeded, email, serviceDetails);
    }
  }

  setBotOptions(botOptions, position) {
    console.log("rawrBotOption: ", botOptions);
    console.log("rwarPosition: ", position);
    if (botOptions.length > 1) {
      this.multipleCards = true;
    } else {
      this.multipleCards = false;
    }
    this.currentResponseCardPosition = position;
    this.botOptionsTitle = botOptions[position].title;
    if (botOptions[position].imageUrl) {
      this.botOptionsImg = true;
    } else {
      this.botOptionsImg = undefined;
    }
    this.loopThroughBotResponseCardButtons(botOptions[position].buttons);
  }

  setBotOptionPagination(currentPosition, responseCards) {
    let responseCardsLength = this.responseCards.length;
    this.currentResponseCardPosition = currentPosition + 1;
    this.botMenuOptions = [];
    if (this.currentResponseCardPosition === responseCardsLength) {
      this.lastResponseCard = true;
      this.currentResponseCardPosition = 0;
    }
    this.botOptionsTitle =
      responseCards[this.currentResponseCardPosition].title;
    this.loopThroughBotResponseCardButtons(
      responseCards[this.currentResponseCardPosition].buttons
    );
  }

  showBotResponseToUser(botResponse) {
    //Display Bot's response to Chat UI
    console.log("hal doing theme: ", botResponse);
    if (
      botResponse.sessionAttributes &&
      botResponse.sessionAttributes.themeChange
    ) {
      this.changingTheme = true;
    } else {
      this.changingTheme = false;
    }
    if (
      botResponse.sessionAttributes &&
      botResponse.sessionAttributes.currentTheme
    ) {
      this.currentTheme = botResponse.sessionAttributes.currentTheme;
    } else {
      this.currentTheme = "portl";
    }
    if (
      botResponse.sessionAttributes &&
      botResponse.sessionAttributes.movieForPurchase
    ) {
      this.showAlivePayModal = true;
    }
    this.showResponse(false, botResponse.message);
    //Check whether the Dialog is at the ending state or not.
    if (botResponse.dialogState !== "Fulfilled" && !botResponse.responseCard) {
      console.log("RAWRWRWRWRWRW");
      this.showMainMenuButton = false;
      this.showBotOptions = false;
      this.showMainMenuOptions = false;
    } else if (
      botResponse.responseCard &&
      botResponse.dialogState !== "Fulfilled"
    ) {
      console.log("MEOWMEOW: ", botResponse.responseCard);
      this.botMenuOptions = [];
      this.responseCards = botResponse.responseCard.genericAttachments;
      this.setBotOptions(this.responseCards, 0);
      //If the Bot response has a Response Card with Options show them in the UI
      // this.botOptionsTitle =
      //   botResponse.responseCard.genericAttachments[0].title;
      // this.showMainMenuOptions = false;
      // this.loopThroughBotResponseCardButtons(
      //   botResponse.responseCard.genericAttachments[0].buttons
      // );
      this.showBotOptions = true;
      this.bounceMenu = "botResponse";
    } else {
      if (botResponse.responseCard) {
        console.log("SPARROWSPARROWSPARROW: ", botResponse.responseCard);
        //If the Bot response has a Response Card with Options show them in the UI
        this.botMenuOptions = [];
        this.multipleCards = false;
        this.botOptionsTitle =
          botResponse.responseCard.genericAttachments[0].title;
        this.loopThroughBotResponseCardButtons(
          botResponse.responseCard.genericAttachments[0].buttons
        );
        this.showMainMenuOptions = false;
        this.showBotOptions = true;
        this.bounceMenu = "botResponse";
      } else {
        this.showBotOptions = false;
        this.showMainMenuOptions = false;
        this.showMainMenuButton = true;
        this.checkBotIntent(botResponse);
      }
    }
  }

  submitMessageToBot(message: any) {
    let usersMessage = this.botMessageInput.nativeElement.innerHTML;
    usersMessage = usersMessage.replace(/<\s*div[^>]*>(.*?)<\s*\/\s*div>/g, "");
    this.showResponse(true, usersMessage);
    let noEmojisMsg = usersMessage.replace(/<\s*img[^>]*>/g, " ");
    let noSpanTags = noEmojisMsg.replace(
      /<\s*span[^>]*>(.*?)<\s*\/\s*span>/g,
      ""
    );
    let cleanMessage = noSpanTags.replace(/&(nbsp|amp|quot|lt|gt);/g, " ");
    this.sendTextMessageToBot(cleanMessage, null);
    this.botMessageInput.nativeElement.innerHTML = "";
  }

  sendTextMessageToBot(textMessage, sessionAttributes) {
    this.userMessageInput = "";
    // Gather needed parameters for Amazon Lex
    let params = {
      botAlias: "$LATEST",
      botName: "PortlMediaBot",
      inputText: textMessage,
      userId: this.lexUserID
    };
    if (sessionAttributes) {
      params["sessionAttributes"] = sessionAttributes;
    }
    // Send Main Menu Button text value to Amazon Lex Bot
    this.lexRuntime.postText(params, (err, data) => {
      if (err) {
        console.log(err, err.stack);
      }
      if (data) {
        console.log("boooottttttttt: ", data);
        this.showBotResponseToUser(data);
      }
    });
  }

  setBotThemeToMovie(movie) {
    if (movie === "jurassic world") {
      console.log("jurassic");
      this.currentTheme = "jurassic";
    } else if (movie === "skyscraper") {
      console.log("skyscraper");
      this.currentTheme = "skyscraper";
    }
  }

  chooseBotOption(evt: any) {
    let optionText = evt.target.value;
    let themeSessionAttribute = null;
    if (this.changingTheme) {
      console.log("notoften");
      this.setBotThemeToMovie(optionText);
      themeSessionAttribute = {
        currentTheme: optionText
      };
    }
    this.showResponse(true, optionText);
    this.sendTextMessageToBot(optionText, themeSessionAttribute);
    this.bounceMenu = "button";
  }

  chooseMainOption(evt: any) {
    //Get text value from Main Menu Button
    let optionText = evt.target.value;
    // Show Main Menu Button text value in Messages UI
    this.showResponse(true, optionText);
    this.sendTextMessageToBot(optionText, null);
  }

  modalState(evt: any) {
    this.showAlivePayModal = evt;
  }
}
