import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  template: `<div class="text-center p-4 border rounded bg-light"><h5>{{ title }}</h5><p class="text-muted mb-0">{{ message }}</p></div>`
})
export class EmptyStateComponent {
  @Input() title = 'No data available';
  @Input() message = 'Try adjusting filters or create a new attendance session.';
}
