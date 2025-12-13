// src/app/templates/template-list/template-list.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

import {
  TemplateService,
  TemplateModel,
} from '../../services/template.service';

@Component({
  selector: 'app-template-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './template-list.component.html',
  styleUrls: ['./template-list.component.scss'],
})
export class TemplateListComponent implements OnInit {
  templates: TemplateModel[] = [];
  loading = false;

  constructor(private service: TemplateService, private router: Router) {}

  ngOnInit(): void {
    this.loadTemplates();
  }

  // 🔥 ALWAYS fetch fresh data
  loadTemplates(): void {
    this.loading = true;
    console.log('Loading templates...');

    this.service.getTemplates().subscribe({
      next: (data) => {
        console.log('Templates loaded:', data);

        // 🔥 Force Angular to re-render
        this.templates = [...data];
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load templates', err);
        this.loading = false;
      },
    });
  }

  editTemplate(id: number): void {
    console.log('Navigate to edit:', id);
    this.router.navigate(['/templates/edit', id]);
  }

  previewTemplate(id: number): void {
    console.log('Navigate to preview:', id);
    this.router.navigate(['/templates/preview', id]);
  }

  deleteTemplate(id: number): void {
    if (!confirm('Are you sure you want to delete this template?')) return;

    console.log('Deleting template:', id);

    this.service.deleteTemplate(id).subscribe({
      next: () => {
        console.log('Delete successful');
        this.loadTemplates(); // refresh list
      },
      error: (err) => {
        console.error('Delete failed', err);
      },
    });
  }

  // ✔ Required for *ngFor trackBy
  trackById(index: number, item: TemplateModel): number {
    return item.id;
  }
}
