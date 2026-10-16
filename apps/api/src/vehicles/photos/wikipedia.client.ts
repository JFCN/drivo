import { Injectable } from '@nestjs/common';

export type WikipediaLanguage = 'en' | 'pt';

export type WikipediaImage = {
  title: string;
  imageUrl: string;
  pageUrl: string;
};

export type DownloadedImage = {
  data: Buffer;
  mimeType: string;
};

type SearchResponse = {
  query?: {
    pages?: Array<{
      title: string;
      index?: number;
      thumbnail?: { source: string };
    }>;
  };
};

const USER_AGENT = 'Drivo/1.0 (aplicacao de estudo; leitura de imagens publicas da Wikipedia)';
const TIMEOUT_MS = 6000;
const MAX_IMAGE_BYTES = 3 * 1024 * 1024;
const IMAGE_WIDTH = 960;

@Injectable()
export class WikipediaClient {
  async searchImages(term: string, language: WikipediaLanguage): Promise<WikipediaImage[]> {
    const params = new URLSearchParams({
      action: 'query',
      format: 'json',
      formatversion: '2',
      generator: 'search',
      gsrsearch: term,
      gsrlimit: '5',
      prop: 'pageimages',
      piprop: 'thumbnail',
      pithumbsize: String(IMAGE_WIDTH),
      pilicense: 'free',
    });

    const response = await fetch(`https://${language}.wikipedia.org/w/api.php?${params}`, {
      headers: { 'User-Agent': USER_AGENT },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!response.ok) {
      return [];
    }

    const body = (await response.json()) as SearchResponse;
    return (body.query?.pages ?? [])
      .filter((page) => page.thumbnail?.source)
      .sort((first, second) => (first.index ?? 0) - (second.index ?? 0))
      .map((page) => ({
        title: page.title,
        imageUrl: page.thumbnail!.source,
        pageUrl: `https://${language}.wikipedia.org/wiki/${encodeURIComponent(page.title.replace(/ /g, '_'))}`,
      }));
  }

  async download(url: string): Promise<DownloadedImage | null> {
    const response = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    const mimeType = response.headers.get('content-type')?.split(';')[0] ?? '';
    if (!response.ok || !['image/jpeg', 'image/png', 'image/webp'].includes(mimeType)) {
      return null;
    }

    const data = Buffer.from(await response.arrayBuffer());
    return data.length > 0 && data.length <= MAX_IMAGE_BYTES ? { data, mimeType } : null;
  }
}
