// src/app/app.component.ts
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, MatToolbarModule, MatIconModule],
  template: `
    <mat-toolbar color="primary" class="mat-elevation-z4">
      <span style="font-weight:600">Contract Template Editor</span>
      <span class="spacer"></span>
      <a mat-icon-button routerLink="/templates" aria-label="Templates">
        <mat-icon>description</mat-icon>
      </a>
    </mat-toolbar>
    <main class="main">
      <router-outlet></router-outlet>
    </main>
  `,
  styles: [
    `
      .main {
        padding: 16px;
      }
      .spacer {
        flex: 1 1 auto;
      }
    `,
  ],
})
export class AppComponent {}
