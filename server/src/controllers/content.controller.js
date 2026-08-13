import { contentService } from '../services/content.service.js';
import { asyncHandler } from '../utils/async-handler.js';

export class ContentController {
  constructor(service = contentService) {
    this.service = service;

    this.getContent = asyncHandler(this.getContent.bind(this));
    this.updateContent = asyncHandler(this.updateContent.bind(this));
  }

  /** GET /api/content */
  async getContent(_req, res) {
    const content = await this.service.getContent();
    res.json({ ok: true, data: content });
  }

  /** PUT /api/content — admin only. */
  async updateContent(req, res) {
    const content = await this.service.replaceContent(req.validated);
    res.json({ ok: true, data: content });
  }
}

export const contentController = new ContentController();
