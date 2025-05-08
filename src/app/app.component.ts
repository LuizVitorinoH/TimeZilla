import { Component } from '@angular/core';
import { TrackerComponent } from './tracker/tracker.component';
import { NgxMaskDirective } from 'ngx-mask';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [TrackerComponent],
  template: '<app-tracker></app-tracker>',
  styleUrls: ['./app.component.css']
})
export class AppComponent {}
