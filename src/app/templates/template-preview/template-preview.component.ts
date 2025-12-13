import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import {
  TemplateService,
  TemplateModel,
} from '../../services/template.service';

@Component({
  selector: 'app-template-preview',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './template-preview.component.html',
  styleUrls: ['./template-preview.component.scss'],
})
export class TemplatePreviewComponent implements OnInit {
  template: TemplateModel | null = null;
  loading = true;

  constructor(
    private service: TemplateService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadTemplate(id);
  }

  loadTemplate(id: number) {
    this.loading = true;
    this.service.getTemplate(id).subscribe({
      next: (data) => {
        this.template = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        alert('Failed to load template!');
      },
    });
  }
}
