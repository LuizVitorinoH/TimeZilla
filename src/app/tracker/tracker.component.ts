import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

interface Activity {
  description: string;
  hours: number;
}

@Component({
  selector: 'app-tracker',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './tracker.component.html',
  styleUrls: ['./tracker.component.css']
})
export class TrackerComponent implements OnInit {
  form: FormGroup;
  targetHours: number = 0;
  activities: Activity[] = [];
  totalSpentHours: number = 0;
  editingIndex: number | null = null;
  timerSeconds = 0;
  timerInterval: any;
  isRunning = false;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      target: [null, [Validators.required, Validators.min(0)]],
      description: [''],
      hours: ['', [Validators.min(0.25)]]
    });
  }

  ngOnInit(): void {
    this.loadFromStorage();
  }

  private parseTimeToDecimal(time: string): number {
    const [hh, mm] = time.split(':').map(Number);
    return (isNaN(hh) ? 0 : hh) + (isNaN(mm) ? 0 : mm / 60);
  }

  setTarget() {
    this.targetHours = this.parseTimeToDecimal(this.form.value.target);
    this.saveToStorage();
  }

  addActivity() {
    const { description, hours } = this.form.value;
    if (!description || !hours) return;

    const decimalHours = this.parseTimeToDecimal(hours);
    this.activities.push({ description, hours: decimalHours });
    this.totalSpentHours += decimalHours;

    this.form.patchValue({ description: '', hours: '' });
    this.saveToStorage();
  }

  updateActivity() {
    if (this.editingIndex === null) return;

    const { description, hours } = this.form.value;
    if (!description || !hours) return;

    const decimalHours = this.parseTimeToDecimal(hours);

    this.totalSpentHours -= this.activities[this.editingIndex].hours;
    this.activities[this.editingIndex] = { description, hours: decimalHours };
    this.totalSpentHours += decimalHours;

    this.form.patchValue({ description: '', hours: '' });
    this.editingIndex = null;
    this.saveToStorage();
  }

  remainingHours(): number {
    return this.targetHours - this.totalSpentHours;
  }

  saveToStorage() {
    if (typeof window === 'undefined') return;

    localStorage.setItem('targetHours', JSON.stringify(this.targetHours));
    localStorage.setItem('activities', JSON.stringify(this.activities));
    localStorage.setItem('totalSpentHours', JSON.stringify(this.totalSpentHours));
  }


  loadFromStorage() {
    if (typeof window === 'undefined') return;

    const storedTarget = localStorage.getItem('targetHours');
    const storedActivities = localStorage.getItem('activities');
    const storedSpent = localStorage.getItem('totalSpentHours');

    if (storedTarget) this.targetHours = JSON.parse(storedTarget);
    if (storedActivities) this.activities = JSON.parse(storedActivities);
    if (storedSpent) this.totalSpentHours = JSON.parse(storedSpent);
  }

  removeActivity(index: number) {
    this.totalSpentHours -= this.activities[index].hours;
    this.activities.splice(index, 1);
    this.saveToStorage();
  }

  editActivity(index: number) {
    const activity = this.activities[index];
    this.form.patchValue({
      description: activity.description,
      hours: activity.hours
    });
    this.editingIndex = index;
  }

  applyHourMask(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');

    if (value.length > 4) {
      value = value.substring(0, 4);
    }

    if (value.length >= 3) {
      value = value.replace(/(\d{2})(\d{1,2})/, '$1:$2');
    }

    input.value = value;

    const controlName = input.getAttribute('formControlName');
    if (controlName) {
      this.form.get(controlName)?.setValue(value, { emitEvent: false });
    }
  }

  convertToTimeFormat(value: number): string {
    const hours = Math.floor(value);
    const minutes = Math.round((value - hours) * 60);
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  }

  clearAll() {
    this.activities = [];
    this.totalSpentHours = 0;
    this.targetHours = 0;
    this.editingIndex = null;
    this.form.reset();
    localStorage.clear();
  }


  get timerDisplay(): string {
    const hrs = Math.floor(this.timerSeconds / 3600);
    const mins = Math.floor((this.timerSeconds % 3600) / 60);
    const secs = this.timerSeconds % 60;
    return `${this.pad(hrs)}:${this.pad(mins)}:${this.pad(secs)}`;
  }

  pad(value: number): string {
    return value < 10 ? `0${value}` : `${value}`;
  }

  toggleTimer() {
    if (this.isRunning) {
      clearInterval(this.timerInterval);
    } else {
      this.timerInterval = setInterval(() => this.timerSeconds++, 1000);
    }
    this.isRunning = !this.isRunning;
  }

  resetTimer() {
    clearInterval(this.timerInterval);
    this.timerSeconds = 0;
    this.isRunning = false;
  }
}
