import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface TemplateModel {
  id: number;
  name: string;
  content: string;
  fields?: any[];
}

@Injectable({ providedIn: "root" })
export class TemplateService {
  private base = "http://localhost:3000/templates";

  constructor(private http: HttpClient) {}

  getTemplates(): Observable<TemplateModel[]> {
    return this.http.get<TemplateModel[]>(this.base);
  }

  getTemplate(id: number): Observable<TemplateModel> {
    return this.http.get<TemplateModel>(`${this.base}/${id}`);
  }

  createTemplate(template: Partial<TemplateModel>): Observable<TemplateModel> {
    return this.http.post<TemplateModel>(this.base, template);
  }

  uploadFile(data: FormData) {
    return this.http.post("http://localhost:3000/upload", data);
  }

  updateTemplate(
    id: number,
    template: Partial<TemplateModel>
  ): Observable<TemplateModel> {
    return this.http.put<TemplateModel>(`${this.base}/${id}`, template);
  }

  deleteTemplate(id: number): Observable<any> {
    return this.http.delete(`${this.base}/${id}`);
  }
}
