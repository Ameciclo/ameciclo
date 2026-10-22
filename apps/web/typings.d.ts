export type Series = {
  name: string | undefined;
  data: number[];
  visible?: boolean
};

export type footerColumnContent = {
  label: string;
  url: string;
};

export type footerColumn = {
  title: string;
  content: footerColumnContent[];
  align: string;
  button?: {
    label: string;
    url: string;
  };
};

export type crumb = {
  label: string;
  slug: string;
  routes: string[];
};

export type ImageWithLink = {
  src: string;
  alt: string;
  url: string;
};

export type FeaturedPage = {
  title: string;
  icon: string;
  url: string;
  text: string;
};

export type document = {
  title: string;
  description: string;
  url: string;
  type: string;
  release_date: string;
  cover: any;
};
export type layersData = {
  type: string;
  name: string;
  crs: {
    type: string;
    properties: {
      name: string;
    };
  };
  features: any[];
};

export type pointData = {
  key: string;
  latitude: number;
  longitude: number;
  popup?: any;
  size?: number;
  color?: string;
  type?: string;
};

export type city = {
  name: string;
  population: number;
  area: number;
  id: number;
  reviews: any[];
};

export interface PcrCountSummary {
  total: number;
  hour_max: number;
  cargo_percent: number;
  wrong_way_percent: number;
}

export interface PcrCountLocation {
  coordinates: [number, number]; // [longitude, latitude]
  type: string;
}

export interface PcrCountDataHour {
  [hour: string]: number; // e.g., "5": 46
}

export interface PcrCountDataCategory {
  count_per_hour: PcrCountDataHour;
}

export interface PcrCountData {
  qualitative: {
    total: PcrCountDataCategory;
    cargo: PcrCountDataCategory;
    wrong_way: PcrCountDataCategory;
    // ... other qualitative categories
  };
  quantitative: {
    [movement: string]: PcrCountDataCategory; // e.g., "movimento_1"
  };
}

export interface PcrCounting {
  name: string;
  date: string; // This is a string, not a Date object
  location: PcrCountLocation;
  data: PcrCountData;
  summary: PcrCountSummary;
}

export interface Project {
  id: string;
  name: string;
  slug: string;
  description: string;
  media: {
    url: string;
  };
}
