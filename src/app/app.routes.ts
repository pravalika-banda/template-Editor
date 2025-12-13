// src/app/app.routes.ts
import { Routes } from "@angular/router";

export const routes: Routes = [
  {
    path: "templates",
    children: [
      {
        path: "",
        loadComponent: () =>
          import("./templates/template-list/template-list.component").then(
            (m) => m.TemplateListComponent
          ),
      },
      {
        path: "create",
        loadComponent: () =>
          import("./templates/template-editor/template-editor.component").then(
            (m) => m.TemplateEditorComponent
          ),
      },
      {
        path: "edit/:id",
        loadComponent: () =>
          import("./templates/template-editor/template-editor.component").then(
            (m) => m.TemplateEditorComponent
          ),
      },
      {
        path: "preview/:id",
        loadComponent: () =>
          import(
            "./templates/template-preview/template-preview.component"
          ).then((m) => m.TemplatePreviewComponent),
      },
    ],
  },
  { path: "", redirectTo: "templates", pathMatch: "full" },
  { path: "**", redirectTo: "templates" },
];
