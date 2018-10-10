import { Component, OnInit, Input, EventEmitter, Output } from "@angular/core";

@Component({
  selector: "a5-alivepay-modal",
  templateUrl: "./a5-alivepay-modal.component.html",
  styleUrls: ["./a5-alivepay-modal.component.css"]
})
export class A5AlivepayModalComponent implements OnInit {
  @Input()
  showModal: boolean;
  @Output()
  modalHidden = new EventEmitter();
  constructor() {}

  ngOnInit() {}

  hideModal() {
    this.showModal = false;
    this.modalHidden.emit(this.showModal);
  }
}
