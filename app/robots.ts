import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/api/', '/app/', '/dashboard/', '/settings/', '/login', '/register'],
            },
        ],
        host: 'https://olleey.com',
        sitemap: 'https://olleey.com/sitemap.xml',
    };
}
