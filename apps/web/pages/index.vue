<template>
    <div>
        <!-- SLIDER BEGIN -->
        <div
                class="relative max-h-[600px] flex flex-col w-full aspect-[4/3] gap-1 mx-auto flex flex-col max-h-[600px] aspect-[4/3] md:justify-center"
        >
            <SfScrollable
                    class="w-full h-full snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                    :active-index="activeIndex"
                    wrapper-class="h-full group/scrollable"
                    is-active-index-centered
                    :previous-disabled="activeIndex === 0"
                    :next-disabled="activeIndex === images.length - 1"
                    buttons-placement="block"
                    @on-prev="activeIndex -= 1"
                    @on-next="activeIndex += 1"
                    :drag="{ containerWidth: true }"
                    @on-drag-end="onDragged"
            >
                <template #previousButton="defaultProps">
                    <SfButton
                            v-bind="defaultProps"
                            :disabled="activeIndex === 0"
                            class="absolute hidden group-hover/scrollable:block disabled:!hidden !rounded-full !p-3 z-10 top-1/2 left-4 bg-white"
                            variant="secondary"
                            size="lg"
                            square
                    >
                        <SfIconChevronLeft />
                    </SfButton>
                </template>
                <div
                        v-for="({ imageSrc, alt }, index) in images"
                        :key="`${alt}-${index}`"
                        class="relative flex justify-center basis-full snap-center snap-always shrink-0 grow"
                >
                    <img
                            :aria-label="alt"
                            :aria-hidden="activeIndex !== index"
                            class="w-auto h-full"
                            :alt="alt"
                            :src="imageSrc"
                            draggable="false"
                    />
                </div>
                <template #nextButton="defaultProps">
                    <SfButton
                            v-bind="defaultProps"
                            :disabled="activeIndex === images.length - 1"
                            class="absolute hidden group-hover/scrollable:block disabled:!hidden !rounded-full !p-3 z-10 top-1/2 right-4 bg-white"
                            variant="secondary"
                            size="lg"
                            square
                    >
                        <SfIconChevronRight />
                    </SfButton>
                </template>
            </SfScrollable>
            <div class="flex-shrink-0 basis-auto">
                <div
                        class="flex-row w-full flex gap-0.5 mt [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                >
                    <button
                            v-for="({ alt }, index) in images"
                            :key="`${index}-bullet`"
                            :aria-current="activeIndex === index"
                            :aria-label="alt"
                            :class="[
                  'w-full relative mt-1 border-b-4 transition-colors focus-visible:outline focus-visible:outline-offset-0 pointer-events-none',
                  activeIndex === index ? 'border-primary-700' : 'border-gray-200',
                  ]"
                            @click="activeIndex = index"
                    />
                </div>
            </div>
        </div>
        <!-- SLIDER END -->
        <div class="max-w-screen-3xl mx-auto md:px-6 lg:px-10">
            <!-- TITLE BEGIN -->
            <div class="relative mx-auto flex md:justify-center p-4">
                <h1 class="align-center">
                    <strong>Demoshop<br /></strong> Fachhandel für Gewürze aus aller Welt
                </h1>
            </div>
            <!-- TITLE END -->
            <!-- CATEGORIES BEGIN -->
            <div class="flex flex-wrap gap-4 lg:gap-6 lg:flex-no-wrap justify-center">
                <div
                        v-for="{ title, image } in categories1"
                        :key="title"
                        role="img"
                        :aria-label="title"
                        :aria-labelledby="`image-${title}`"
                        class="relative flex-col min-w-[140px] max-h-[312px] justify-center group"
                >
                    <img
                            :src="image"
                            :alt="title"
                            format="png"
                            class=""
                            width="469"
                            height="auto"
                            loading="lazy"
                    />
                    <div :id="`image-${title}`" class="flex justify-center">
                        <div
                                class="mt-4 font-semibold no-underline text-normal-900 typography-text-base group-hover:text-primary-800 group-active:text-primary-800"
                        >
                            {{ title }}
                        </div>
                    </div>
                </div>
            </div>
            <div class="flex flex-wrap gap-4 lg:gap-6 lg:flex-no-wrap justify-center my-10 pt-4">
                <div
                        v-for="{ title, image } in categories2"
                        :key="title"
                        role="img"
                        :aria-label="title"
                        :aria-labelledby="`image-${title}`"
                        class="relative flex-col min-w-[140px] max-w-[812px] justify-center group"
                >
                    <img
                            :src="image"
                            :alt="title"
                            format="png"
                            class=""
                            height="408"
                            loading="lazy"
                    />
                    <div :id="`image-${title}`" class="flex justify-center">
                        <div
                                class="mt-4 font-semibold no-underline text-normal-900 typography-text-base group-hover:text-primary-800 group-active:text-primary-800"
                        >
                            {{ title }}
                        </div>
                    </div>
                </div>
            </div>
            <!-- CATEGORIES END -->
            <!-- ITEM LIST 1 BEGIN -->
            <NuxtLazyHydrate when-visible>
                <section class="mt-28 mb-20 overflow-hidden">
                    <p data-testid="recommended-products" class="my-4 typography-text-lg">
                        {{ t('topseller') }}
                    </p>
                    <ProductRecommendedProducts cache-key="homepage" :category-id="recommendedProductsCategoryId" />
                </section>
            </NuxtLazyHydrate>
            <!-- ITEM LIST 1 END -->
            <!-- ITEM LIST 2 BEGIN -->
            <NuxtLazyHydrate when-visible>
                <section class="mt-28 mb-20 overflow-hidden">
                    <p data-testid="recommended-products" class="my-4 typography-text-lg">
                        {{ t('topseller') }}
                    </p>
                    <ProductRecommendedProducts cache-key="homepage" :category-id="recommendedProductsCategoryId" />
                </section>
            </NuxtLazyHydrate>

            <!-- ITEM LIST 2 END -->
            <!-- SEO TEXT BEGIN -->
            <div>
                <h2>Willkommen im DemoShop – Ihr Online-Ziel für hochwertige Produkte</h2>

                <p>Willkommen im DemoShop, Ihrem erstklassigen Online-Shop für eine breite Palette hochwertiger Produkte! Unser Ziel ist es, Ihnen ein unvergleichliches Einkaufserlebnis zu bieten, das durch erstklassige Produkte, hervorragenden Kundenservice und unschlagbare Preise gekennzeichnet ist.</p>

                <h3>Entdecken Sie unser vielfältiges Produktsortiment</h3>

                <p>Im DemoShop finden Sie eine sorgfältig kuratierte Auswahl an Produkten aus verschiedenen Kategorien. Ob Elektronik, Mode, Haushaltswaren oder Spielzeug – wir haben für jeden Geschmack und Bedarf das Richtige. Unsere Produktkategorien umfassen:</p>
                <ul>
                    <li><strong>Elektronik</strong>: Modernste Gadgets, Smartphones, Laptops und Zubehör</li>
                    <li><strong>Mode</strong>: Trendige Kleidung, Schuhe und Accessoires für Damen, Herren und Kinder</li>
                    <li><strong>Haushaltswaren</strong>: Hochwertige Küchengeräte, Möbel und Dekorationsartikel</li>
                    <li><strong>Spielzeug</strong>: Spaßige und lehrreiche Spielsachen für Kinder jeden Alters</li>
                </ul>

                <h3>Warum DemoShop?</h3>
                <h4>1. Qualität und Vielfalt</h4>
                <p>Wir bieten nur Produkte von renommierten Marken und geprüften Lieferanten an, um sicherzustellen, dass Sie stets die beste Qualität erhalten. Unsere umfangreiche Auswahl ermöglicht es Ihnen, alles, was Sie benötigen, bequem an einem Ort zu finden.</p>

                <h4>2. Exzellenter Kundenservice</h4>
                <p>Ihre Zufriedenheit ist unser oberstes Ziel. Unser engagiertes Kundenservice-Team steht Ihnen rund um die Uhr zur Verfügung, um Ihre Fragen zu beantworten und Ihnen bei allen Anliegen zu helfen.</p>

                <h4>3. Sichere und bequeme Bezahlung</h4>
                <p>Wir bieten verschiedene sichere Zahlungsmethoden an, um Ihnen den Einkauf so einfach wie möglich zu gestalten. Ihre Daten sind bei uns stets sicher und geschützt.</p>

                <h4>4. Schneller Versand</h4>
                <p>Dank unserer effizienten Logistikpartner erhalten Sie Ihre Bestellungen schnell und zuverlässig. Wir bieten zudem eine einfache Rückgabe- und Umtauschpolitik, falls Sie mit Ihrem Kauf nicht zufrieden sind.</p>

                <h3>Aktuelle Angebote und Sonderaktionen</h3>
                <p>Bleiben Sie auf dem Laufenden über unsere regelmäßigen Sonderaktionen und Rabatte. Melden Sie sich für unseren Newsletter an und verpassen Sie keine exklusiven Angebote und Neuigkeiten. Im DemoShop ist immer etwas Spannendes los, und wir möchten, dass Sie als Erste davon erfahren.</p>

                <h3>Umweltbewusstsein und Nachhaltigkeit</h3>
                <p>Wir bei DemoShop sind uns unserer Verantwortung gegenüber der Umwelt bewusst. Deshalb setzen wir auf nachhaltige Verpackungen und umweltfreundliche Versandmethoden. Unsere Produkte werden unter fairen und umweltfreundlichen Bedingungen hergestellt, damit Sie mit gutem Gewissen bei uns einkaufen können.</p>

                <h3>Kundenbewertungen und Testimonials</h3>
                <p>Lesen Sie die Erfahrungen unserer zufriedenen Kunden und überzeugen Sie sich selbst von der Qualität unserer Produkte und unseres Services. Ihre Meinung ist uns wichtig, und wir freuen uns über jedes Feedback, das uns hilft, noch besser zu werden.</p>

                <h3>Kontaktieren Sie uns</h3>
                <p>Haben Sie Fragen oder benötigen Sie Hilfe? Zögern Sie nicht, uns zu kontaktieren. Unser freundliches und kompetentes Team steht Ihnen jederzeit zur Verfügung. Besuchen Sie unsere Kontaktseite für weitere Informationen.</p>

                <h3>DemoShop – Ihr vertrauenswürdiger Online-Shop</h3>
                <p>DemoShop ist mehr als nur ein Online-Shop – wir sind Ihr Partner für ein erstklassiges Einkaufserlebnis. Durchstöbern Sie unser umfangreiches Sortiment, genießen Sie unsere exklusiven Angebote und erleben Sie den besten Kundenservice. Willkommen im DemoShop, wo Qualität und Kundenzufriedenheit an erster Stelle stehen.</p>

                <p>Starten Sie jetzt Ihr Einkaufserlebnis und entdecken Sie die Welt von DemoShop. Wir freuen uns auf Ihren Besuch!</p>
            </div>
            <!-- SEO TEXT END -->

        </div>
    </div>
</template>
<script lang="ts" setup>
import { ref, computed, watch } from 'vue';
import {
    SfLink,
    SfButton,
    SfIconFavorite,
    SfIconChevronLeft,
    SfIconChevronRight,
    SfScrollable,
    type SfScrollableOnDragEndData,
} from '@storefront-ui/vue';

const viewport = useViewport();
const { t } = useI18n();
const { data: categoryTree } = useCategoryTree();
const recommendedProductsCategoryId = ref('');
definePageMeta({ pageType: 'static' });

type Size = {
    width: string;
    height: string;
};
type Sizes = {
    lg: Size;
    md: Size;
    sm: Size;
};
type SizeKey = keyof Sizes;

const getSizeForViewport = (sizes: Sizes) => {
    const breakpoint = viewport.breakpoint.value as SizeKey;
    return sizes[breakpoint];
};

watch(
    () => categoryTree.value,
    async () => {
        const firstCategoryId = categoryTree.value?.[0]?.id;
        if (firstCategoryId) recommendedProductsCategoryId.value = firstCategoryId.toString();
    },
    { immediate: true },
);

const displayDetails = computed(() => {
    return [
        {
            image: `https://cdn02.plentymarkets.com/8mxess9fwmd8/frontend/Gewuerze/Gewuerzmischung.jpg`,
            title: t('homepage.displayDetails.detail1.title'),
            subtitle: t('homepage.displayDetails.detail1.subtitle'),
            description: t('homepage.displayDetails.detail1.description'),
            buttonText: t('homepage.displayDetails.detail1.buttonText'),
            reverse: false,
            titleClass: 'md:typography-display-2',
            subtitleClass: 'md:typography-headline-6',
            descriptionClass: 'md:typography-text-lg',
            sizes: {
                lg: {
                    width: '728',
                    height: '728',
                },
                md: {
                    width: '488',
                    height: '488',
                },
                sm: {
                    width: '320',
                    height: '320',
                },
            },
        },
        {
            image: `/images/${viewport.breakpoint.value}/homepage-display-2.avif`,
            title: t('homepage.displayDetails.detail2.title'),
            subtitle: t('homepage.displayDetails.detail2.subtitle'),
            description: t('homepage.displayDetails.detail2.description'),
            buttonText: t('homepage.displayDetails.detail2.buttonText'),
            reverse: true,
            backgroundColor: 'bg-warning-200',
            sizes: {
                lg: {
                    width: '358',
                    height: '358',
                },
                md: {
                    width: '472',
                    height: '472',
                },
                sm: {
                    width: '320',
                    height: '320',
                },
            },
        },
        {
            image: `/images/${viewport.breakpoint.value}/homepage-display-3.avif`,
            title: t('homepage.displayDetails.detail3.title'),
            subtitle: t('homepage.displayDetails.detail3.subtitle'),
            description: t('homepage.displayDetails.detail3.description'),
            buttonText: t('homepage.displayDetails.detail3.buttonText'),
            reverse: false,
            backgroundColor: 'bg-secondary-200',
            sizes: {
                lg: {
                    width: '358',
                    height: '358',
                },
                md: {
                    width: '238',
                    height: '238',
                },
                sm: {
                    width: '320',
                    height: '320',
                },
            },
        },
    ];
});

const headPhones = {
    image: `/images/${viewport.breakpoint.value}/homepage-hero-headphones.avif`,
    sizes: {
        lg: {
            width: '800',
            height: '600',
        },
        md: {
            width: '800',
            height: '600',
        },
        sm: {
            width: '640',
            height: '480',
        },
    },
};

const background = {
    image: `/images/${viewport.breakpoint.value}/homepage-hero-bg.avif`,
    sizes: {
        lg: {
            width: '4000',
            height: '600',
        },
        md: {
            width: '1024',
            height: '600',
        },
        sm: {
            width: '640',
            height: '752',
        },
    },
};

const categories1 = [
    {
        title: t('homepage.cat1'),
        image: 'https://cdn02.plentymarkets.com/8mxess9fwmd8/frontend/pwa/homepage/gewuerzmischung.png',
    },
    {
        title: t('homepage.cat2'),
        image: 'https://cdn02.plentymarkets.com/8mxess9fwmd8/frontend/pwa/homepage/gewuerze.png',
    },
    {
        title: t('homepage.cat3'),
        image: 'https://cdn02.plentymarkets.com/8mxess9fwmd8/frontend/pwa/homepage/tee.png',
    },
];
const categories2 = [
    {
        title: t('homepage.cat4'),
        image: 'https://cdn02.plentymarkets.com/8mxess9fwmd8/frontend/pwa/homepage/sales.png',
    },
    {
        title: t('homepage.cat5'),
        image: 'https://cdn02.plentymarkets.com/8mxess9fwmd8/frontend/pwa/homepage/set1.png',
    },
];

useHead({
    link: [
        {
            rel: 'preload',
            href: background.image,
            as: 'image',
        },
        {
            rel: 'preload',
            href: headPhones.image,
            as: 'image',
        },
    ],
});

const withBase = (filepath: string) => `https://cdn02.plentymarkets.com/8mxess9fwmd8/frontend/Gewuerze/${filepath}`;

const images = [
    { imageSrc: withBase('Startseite.jpg'), imageThumbSrc: withBase('Startseite.jpg'), alt: 'backpack1' },
    { imageSrc: withBase('Startseite1-2.jpg'), imageThumbSrc: withBase('Startseite1-2.jpg'), alt: 'backpack2' },
];

const activeIndex = ref(0);

const onDragged = (event: SfScrollableOnDragEndData) => {
    if (event.swipeRight && activeIndex.value > 0) {
        activeIndex.value -= 1;
    } else if (event.swipeLeft && activeIndex.value < images.length - 1) {
        activeIndex.value += 1;
    }
};

const products = Array.from(Array(10), (_, i) => ({
    id: i.toString(),
    name: 'Athletic mens walking sneakers',
    price: '$2,345.99',
    img: {
        src: 'https://storage.googleapis.com/sfui_docs_artifacts_bucket_public/production/sneakers.png',
        alt: 'White sneaker shoe',
    },
}));
</script>

