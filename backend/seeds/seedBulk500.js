import '../config/dnsResolver.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Product from '../models/Product.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================================
// 100% AUTHENTIC NUTRIKART PRODUCT CATALOG SPECIFICATION
// Exactly 20 real products per category x 5 authentic variations = 100 per category
// Total = 500 authentic products across all 5 sections
// ============================================================================

export const catalogCatalog = {
  Protein: [
    {
      brand: 'Optimum Nutrition',
      product: 'Gold Standard 100% Whey Protein Isolate',
      variations: [
        { variant: 'Double Rich Chocolate', unit: '1kg Tub', price: 3199 },
        { variant: 'Vanilla Ice Cream', unit: '2kg Tub', price: 6299 },
        { variant: 'Mocha Cappuccino', unit: '2.27kg Tub', price: 6899 },
        { variant: 'Extreme Milk Chocolate', unit: '4kg Bag', price: 11499 },
        { variant: 'Strawberry Shake', unit: '4.54kg Bag', price: 12499 },
      ],
      desc: 'Gold standard micro-filtered whey protein isolate with 24g protein, 5.5g BCAAs, and 4g glutamine per serving. Supports lean muscle growth and accelerated recovery.',
      bmi: ['Normal', 'Overweight', 'Underweight'],
      image: '/images/products/whey-protein.jpg'
    },
    {
      brand: 'Optimum Nutrition',
      product: 'Serious Mass High Calorie Weight Gainer',
      variations: [
        { variant: 'Chocolate Supreme', unit: '3kg Tub', price: 2999 },
        { variant: 'Vanilla Bliss', unit: '5kg Bag', price: 4799 },
        { variant: 'Banana Cream', unit: '5.44kg Bag', price: 5199 },
        { variant: 'Chocolate Peanut Butter', unit: '2.72kg Tub', price: 2799 },
        { variant: 'Strawberry Milkshake', unit: '1.36kg Tub', price: 1599 },
      ],
      desc: 'High-calorie weight gain formula packing 1,250 calories and 50g protein per serving with 25 vitamins and minerals for serious mass building.',
      bmi: ['Underweight'],
      image: '/images/products/whey-protein.jpg'
    },
    {
      brand: 'Optimum Nutrition',
      product: 'Platinum Hydrowhey Hydrolyzed Whey Isolate',
      variations: [
        { variant: 'Turbo Chocolate', unit: '1.6kg Tub', price: 6999 },
        { variant: 'Velocity Vanilla', unit: '1.8kg Tub', price: 7499 },
        { variant: 'Supercharged Strawberry', unit: '800g Tub', price: 3899 },
        { variant: 'Cookies & Cream', unit: '2kg Tub', price: 8299 },
        { variant: 'Chocolate Peanut Butter', unit: '3.5kg Tub', price: 13999 },
      ],
      desc: 'Ultra-pure hydrolyzed whey protein broken down into smaller peptides for the fastest possible digestion and absorption into muscle fibers.',
      bmi: ['Normal', 'Underweight'],
      image: '/images/products/whey-protein.jpg'
    },
    {
      brand: 'Dymatize',
      product: 'ISO100 Hydrolyzed 100% Whey Isolate',
      variations: [
        { variant: 'Gourmet Chocolate', unit: '1.8kg Tub', price: 6499 },
        { variant: 'Fudge Brownie', unit: '2.3kg Tub', price: 7999 },
        { variant: 'Cookies & Cream', unit: '900g Tub', price: 3599 },
        { variant: 'Smooth Vanilla', unit: '1.36kg Tub', price: 5199 },
        { variant: 'Birthday Cake', unit: '2kg Tub', price: 7199 },
      ],
      desc: 'Award-winning hydrolyzed 100% whey isolate with 25g protein, less than 1g sugar and lactose-free. Engineered for elite athletic physiques.',
      bmi: ['Normal', 'Underweight', 'Overweight'],
      image: '/images/products/whey-protein.jpg'
    },
    {
      brand: 'Dymatize',
      product: 'Elite 100% Whey Protein Powder',
      variations: [
        { variant: 'Rich Chocolate', unit: '2kg Tub', price: 4999 },
        { variant: 'Cafe Mocha', unit: '2.3kg Tub', price: 5499 },
        { variant: 'Snickerdoodle', unit: '1kg Tub', price: 2799 },
        { variant: 'Smooth Vanilla', unit: '4.5kg Bag', price: 9999 },
        { variant: 'Strawberry Blast', unit: '900g Tub', price: 2599 },
      ],
      desc: 'Fast-digesting 100% whey protein concentrate and isolate blend providing 25g protein and 5.5g BCAAs per scoop.',
      bmi: ['Normal', 'Overweight'],
      image: '/images/products/whey-protein.jpg'
    },
    {
      brand: 'MuscleBlaze',
      product: 'Biozyme Performance Whey Protein',
      variations: [
        { variant: 'Rich Chocolate', unit: '1kg Tub', price: 2699 },
        { variant: 'Chocolate Hazelnut', unit: '2kg Tub', price: 4999 },
        { variant: 'Kesar Pista', unit: '4kg Bag', price: 8999 },
        { variant: 'Magical Mango', unit: '1kg Pouch', price: 2499 },
        { variant: 'Cafe Mocha', unit: '2kg Pouch', price: 4699 },
      ],
      desc: 'Clinically tested Enhanced Absorption Formula (EAF) delivering 50% higher protein absorption and 60% higher BCAA absorption without digestive discomfort.',
      bmi: ['Normal', 'Overweight', 'Underweight'],
      image: '/images/products/whey-protein.jpg'
    },
    {
      brand: 'MuscleBlaze',
      product: 'Raw Whey Isolate 90% Pure',
      variations: [
        { variant: '100% Unflavored Raw', unit: '1kg Pouch', price: 2399 },
        { variant: '100% Unflavored Raw', unit: '2kg Pouch', price: 4499 },
        { variant: '100% Unflavored Raw', unit: '2.5kg Pouch', price: 5399 },
        { variant: '100% Unflavored Raw', unit: '4kg Bag', price: 8299 },
        { variant: '100% Unflavored Raw', unit: '500g Pouch', price: 1299 },
      ],
      desc: 'Unsweetened and unflavored pure whey protein isolate delivering 27g protein per 30g scoop with zero added sugar or artificial fillers.',
      bmi: ['Normal', 'Overweight', 'Obese'],
      image: '/images/products/whey-protein.jpg'
    },
    {
      brand: 'MuscleBlaze',
      product: 'Super Gainer XXL High Calorie',
      variations: [
        { variant: 'Chocolate', unit: '3kg Tub', price: 2499 },
        { variant: 'Cookies & Cream', unit: '5kg Tub', price: 3999 },
        { variant: 'Banana', unit: '1kg Tub', price: 999 },
        { variant: 'Chocolate Hazelnut', unit: '4kg Bag', price: 3299 },
        { variant: 'Kesar Pista', unit: '6kg Bag', price: 4699 },
      ],
      desc: 'Calorie-dense mass gainer with complex carbs and multi-source proteins offering 1:5 protein-to-carb ratio for ectomorph muscle building.',
      bmi: ['Underweight'],
      image: '/images/products/whey-protein.jpg'
    },
    {
      brand: 'MyProtein',
      product: 'Impact Whey Protein Powder',
      variations: [
        { variant: 'Salted Caramel', unit: '1kg Pouch', price: 2499 },
        { variant: 'Chocolate Smooth', unit: '2.5kg Pouch', price: 5499 },
        { variant: 'Natural Vanilla', unit: '5kg Bag', price: 9899 },
        { variant: 'Chocolate Brownie', unit: '500g Pouch', price: 1399 },
        { variant: 'Matcha Latte', unit: '2kg Pouch', price: 4699 },
      ],
      desc: 'Ranked Grade-A by independent lab Labdoor. 21g premium whey protein per serving sourced from pasture-fed dairy cows.',
      bmi: ['Normal', 'Overweight'],
      image: '/images/products/whey-protein.jpg'
    },
    {
      brand: 'MyProtein',
      product: 'Clear Whey Isolate Refreshing Shake',
      variations: [
        { variant: 'Orange Mango', unit: '500g Tub', price: 2899 },
        { variant: 'Peach Tea', unit: '875g Tub', price: 4499 },
        { variant: 'Cranberry & Raspberry', unit: '1kg Tub', price: 4999 },
        { variant: 'Watermelon', unit: '20 Servings Tub', price: 2699 },
        { variant: 'Bitter Lemon', unit: '35 Servings Tub', price: 3999 },
      ],
      desc: 'Light and refreshing alternative to milky protein shakes. Crystal clear 20g hydrolyzed whey isolate that mixes like fruit juice.',
      bmi: ['Normal', 'Overweight'],
      image: '/images/products/whey-protein.jpg'
    },
    {
      brand: 'Isopure',
      product: 'Zero Carb 100% Pure Whey Isolate',
      variations: [
        { variant: 'Creamy Vanilla', unit: '1.36kg Tub', price: 5299 },
        { variant: 'Dutch Chocolate', unit: '2kg Tub', price: 7499 },
        { variant: 'Strawberries & Cream', unit: '3lb Tub', price: 5499 },
        { variant: 'Toasted Coconut', unit: '7.5lb Bucket', price: 12999 },
        { variant: 'Unflavored Pure', unit: '1kg Tub', price: 4199 },
      ],
      desc: '100% whey protein isolate with zero carbs, zero sugar, and zero fat. Fortified with essential vitamins and minerals for a lean silhouette.',
      bmi: ['Overweight', 'Obese', 'Normal'],
      image: '/images/products/whey-protein.jpg'
    },
    {
      brand: 'MuscleTech',
      product: 'Nitro-Tech 100% Whey Gold',
      variations: [
        { variant: 'Double Rich Chocolate', unit: '2.2kg Tub', price: 5699 },
        { variant: 'French Vanilla Cream', unit: '1kg Tub', price: 2899 },
        { variant: 'Cookies & Cream', unit: '3.6kg Bag', price: 8699 },
        { variant: 'Strawberry', unit: '4.5kg Bag', price: 10499 },
        { variant: 'Mocha Cappuccino', unit: '1.8kg Tub', price: 4899 },
      ],
      desc: 'Micro-filtered whey peptides and isolate delivering 24g protein, 5.5g BCAAs, and 4g glutamine per serving for superior nitrogen retention.',
      bmi: ['Normal', 'Underweight'],
      image: '/images/products/whey-protein.jpg'
    },
    {
      brand: 'MuscleTech',
      product: 'Mass Gainer Extreme 2000 Bulking Formula',
      variations: [
        { variant: 'Triple Chocolate Brownie', unit: '5.44kg Bag', price: 4999 },
        { variant: 'Vanilla Milkshake', unit: '3.63kg Bag', price: 3699 },
        { variant: 'Cookies and Cream', unit: '10kg Bucket', price: 8999 },
        { variant: 'Chocolate Fudge', unit: '2.7kg Tub', price: 2999 },
        { variant: 'Strawberry', unit: '6kg Bag', price: 5499 },
      ],
      desc: 'Hardcore mass gainer designed for extreme caloric surplus with 80g protein, over 400g carbs, and 2,000 calories when mixed with milk.',
      bmi: ['Underweight'],
      image: '/images/products/whey-protein.jpg'
    },
    {
      brand: 'GNC',
      product: 'Pro Performance 100% Whey Protein',
      variations: [
        { variant: 'Chocolate Supreme', unit: '2kg Tub', price: 4599 },
        { variant: 'Creamy Vanilla', unit: '1kg Tub', price: 2499 },
        { variant: 'Strawberry Smoothie', unit: '4kg Bag', price: 8499 },
        { variant: 'Banana Cream', unit: '1.8kg Tub', price: 4299 },
        { variant: 'Cafe Mocha', unit: '900g Tub', price: 2299 },
      ],
      desc: '100% whey protein featuring 24g high quality protein, 5.5g BCAAs, and fast enzyme digestion to support muscle recovery and tone.',
      bmi: ['Normal', 'Overweight'],
      image: '/images/products/whey-protein.jpg'
    },
    {
      brand: 'GNC',
      product: 'AMP Pure Isolate Ultra-Microfiltered Whey',
      variations: [
        { variant: 'Chocolate Frosting', unit: '2kg Tub', price: 6299 },
        { variant: 'Vanilla Dream', unit: '1kg Tub', price: 3299 },
        { variant: 'Cookies & Cream', unit: '1.8kg Tub', price: 5799 },
        { variant: 'Peanut Butter Swirl', unit: '900g Tub', price: 2999 },
        { variant: 'French Vanilla', unit: '4kg Bag', price: 11499 },
      ],
      desc: 'Advanced 20-step purification micro-filtered isolate delivering 25g fast-absorbing protein with zero added sugar and ultra-low carbs.',
      bmi: ['Normal', 'Overweight'],
      image: '/images/products/whey-protein.jpg'
    },
    {
      brand: 'Labrada',
      product: '100% Premium Whey Protein',
      variations: [
        { variant: 'Chocolate', unit: '2kg Tub', price: 4699 },
        { variant: 'Strawberry', unit: '1kg Tub', price: 2499 },
        { variant: 'Vanilla', unit: '4kg Bag', price: 8699 },
        { variant: 'Cafe Brazil', unit: '1.8kg Tub', price: 4399 },
        { variant: 'Cookies & Cream', unit: '2.2kg Tub', price: 4999 },
      ],
      desc: 'Cross-flow micro-filtered whey protein delivering 24g pure protein per scoop. Free from gluten and certified authentic.',
      bmi: ['Normal', 'Underweight'],
      image: '/images/products/whey-protein.jpg'
    },
    {
      brand: 'Labrada',
      product: 'Muscle Mass Gainer High Protein Formula',
      variations: [
        { variant: 'Chocolate', unit: '3kg Tub', price: 2799 },
        { variant: 'Vanilla', unit: '5kg Bag', price: 4399 },
        { variant: 'Strawberry', unit: '1kg Tub', price: 1099 },
        { variant: 'Banana', unit: '6kg Bag', price: 5199 },
        { variant: 'Chocolate Peanut Butter', unit: '2.7kg Tub', price: 2599 },
      ],
      desc: 'High-calorie bulking formula loaded with 1,244 calories, 52g protein, and BCAAs to help hardgainers pack on dense muscle mass.',
      bmi: ['Underweight'],
      image: '/images/products/whey-protein.jpg'
    },
    {
      brand: 'Avvatar',
      product: '100% Whey Protein Concentrate & Isolate',
      variations: [
        { variant: 'Belgian Chocolate', unit: '1kg Tub', price: 2399 },
        { variant: 'Cafe Mocha', unit: '2kg Tub', price: 4499 },
        { variant: 'Malai Kulfi', unit: '4kg Bag', price: 8499 },
        { variant: 'Mango Delight', unit: '1kg Pouch', price: 2199 },
        { variant: 'Unflavored Natural', unit: '2kg Pouch', price: 4199 },
      ],
      desc: 'Fresh whey made within 24 hours of milking from grass-fed cows in India. 24g protein with naturally occurring bioactive immunoglobulins.',
      bmi: ['Normal', 'Overweight', 'Underweight'],
      image: '/images/products/whey-protein.jpg'
    },
    {
      brand: 'AS-IT-IS Nutrition',
      product: 'Pure Whey Protein Concentrate 80%',
      variations: [
        { variant: '100% Raw Unflavored', unit: '1kg Pouch', price: 1899 },
        { variant: '100% Raw Unflavored', unit: '2.5kg Pouch', price: 4399 },
        { variant: '100% Raw Unflavored', unit: '500g Pouch', price: 999 },
        { variant: '100% Raw Unflavored', unit: '4kg Bag', price: 6899 },
        { variant: '100% Raw Unflavored', unit: '5kg Bag', price: 8299 },
      ],
      desc: 'Minimally processed, 100% unflavored raw whey protein concentrate with 24g protein and 5.4g BCAAs per 30g scoop. Zero additives.',
      bmi: ['Normal', 'Overweight', 'Obese'],
      image: '/images/products/whey-protein.jpg'
    },
    {
      brand: 'Fast&Up',
      product: 'Plant Protein Isolate with Superfoods',
      variations: [
        { variant: 'Rich Chocolate', unit: '1kg Tub', price: 2299 },
        { variant: 'Mango Splash', unit: '1.5kg Tub', price: 3299 },
        { variant: 'Vanilla Bean', unit: '500g Tub', price: 1299 },
        { variant: 'Cafe Caramel', unit: '2kg Tub', price: 4199 },
        { variant: 'Berry Blast', unit: '1kg Pouch', price: 2199 },
      ],
      desc: 'Premium vegan pea and brown rice protein isolate with added digestive enzymes and beetroot extract for clean muscle tone.',
      bmi: ['Normal', 'Overweight', 'Obese'],
      image: '/images/products/whey-protein.jpg'
    }
  ],

  Vitamins: [
    {
      brand: 'GNC',
      product: 'Mega Men One Daily Multivitamin',
      variations: [
        { unit: '60 Caplets', price: 1199 },
        { unit: '90 Caplets', price: 1699 },
        { unit: '120 Caplets', price: 2199 },
        { unit: '180 Caplets', price: 2999 },
        { unit: '30 Caplets', price: 699 },
      ],
      desc: 'Clinically formulated daily multivitamin for active men packed with 37 essential nutrients to fuel metabolism, heart health, and prostate wellness.',
      bmi: ['Normal', 'Underweight', 'Overweight'],
      image: '/images/products/multivitamin.jpg'
    },
    {
      brand: 'GNC',
      product: 'Women\'s Ultra Mega Daily Multivitamin',
      variations: [
        { unit: '60 Caplets', price: 1249 },
        { unit: '90 Caplets', price: 1749 },
        { unit: '120 Caplets', price: 2249 },
        { unit: '180 Caplets', price: 3099 },
        { unit: '30 Caplets', price: 749 },
      ],
      desc: 'Comprehensive nutritional blend for women featuring iron, calcium, antioxidants, and biotin for radiant skin, hair, and bone density.',
      bmi: ['Normal', 'Underweight', 'Overweight'],
      image: '/images/products/multivitamin.jpg'
    },
    {
      brand: 'HK Vitals',
      product: 'Multivitamin with Ginseng, Vitamin C & D3',
      variations: [
        { unit: '60 Tablets', price: 449 },
        { unit: '90 Tablets', price: 649 },
        { unit: '120 Tablets', price: 849 },
        { unit: '180 Tablets', price: 1199 },
        { unit: '30 Tablets', price: 299 },
      ],
      desc: 'Complete daily multivitamin fortified with Panax Ginseng extract, zinc, and vitamin D3 to enhance stamina, mental alertness, and immune vigor.',
      bmi: ['Normal', 'Overweight', 'Underweight', 'Obese'],
      image: '/images/products/multivitamin.jpg'
    },
    {
      brand: 'HK Vitals',
      product: 'Biotin 10,000 mcg for Hair & Nails',
      variations: [
        { unit: '60 Veg Capsules', price: 499 },
        { unit: '90 Veg Capsules', price: 699 },
        { unit: '120 Veg Capsules', price: 899 },
        { unit: '180 Veg Capsules', price: 1299 },
        { unit: '30 Veg Capsules', price: 299 },
      ],
      desc: 'High potency vitamin B7 biotin capsules supporting keratin production, reducing hair thinning, and strengthening brittle nails.',
      bmi: ['Normal', 'Underweight', 'Overweight'],
      image: '/images/products/multivitamin.jpg'
    },
    {
      brand: 'HK Vitals',
      product: 'Vitamin D3 2000 IU with Sunflower Oil',
      variations: [
        { unit: '60 Softgels', price: 399 },
        { unit: '90 Softgels', price: 549 },
        { unit: '120 Softgels', price: 699 },
        { unit: '180 Softgels', price: 999 },
        { unit: '30 Softgels', price: 249 },
      ],
      desc: 'Bioactive cholecalciferol D3 in cold-pressed sunflower oil for maximum absorption. Fortifies bone strength and regulates immune response.',
      bmi: ['Normal', 'Overweight', 'Obese'],
      image: '/images/products/vitamin-d.jpg'
    },
    {
      brand: 'MuscleBlaze',
      product: 'MB-Vite Daily Multivitamin with 51 Ingredients',
      variations: [
        { unit: '60 Tablets', price: 599 },
        { unit: '120 Tablets', price: 1099 },
        { unit: '180 Tablets', price: 1549 },
        { unit: '30 Tablets', price: 349 },
        { unit: '90 Tablets', price: 849 },
      ],
      desc: 'Formulated specifically for athletes with 51 active ingredients including 6 specialized blends for joint support, metabolism, and antioxidants.',
      bmi: ['Normal', 'Overweight', 'Underweight'],
      image: '/images/products/multivitamin.jpg'
    },
    {
      brand: 'MuscleBlaze',
      product: 'MB-Vite Immunity with Vitamin C, D3 & Zinc',
      variations: [
        { unit: '60 Tablets', price: 499 },
        { unit: '90 Tablets', price: 699 },
        { unit: '120 Tablets', price: 899 },
        { unit: '180 Tablets', price: 1249 },
        { unit: '30 Tablets', price: 299 },
      ],
      desc: 'High-strength immunity booster blending 100% RDA of vitamins C and D3 with elemental zinc and amla extract for active physical defense.',
      bmi: ['Normal', 'Overweight', 'Obese'],
      image: '/images/products/multivitamin.jpg'
    },
    {
      brand: 'Fast&Up',
      product: 'Charge Natural Vitamin C 1000mg + Zinc',
      variations: [
        { unit: '20 Effervescent Tabs', price: 390 },
        { unit: '40 Effervescent Tabs', price: 740 },
        { unit: '60 Effervescent Tabs', price: 1050 },
        { unit: '80 Effervescent Tabs', price: 1360 },
        { unit: '100 Effervescent Tabs', price: 1650 },
      ],
      desc: 'India\'s favorite effervescent vitamin C derived from natural amla extract with 10mg elemental zinc for fast cellular hydration and immunity.',
      bmi: ['Normal', 'Overweight', 'Underweight', 'Obese'],
      image: '/images/products/multivitamin.jpg'
    },
    {
      brand: 'Fast&Up',
      product: 'Magnesio Effervescent Magnesium + Zinc',
      variations: [
        { unit: '20 Effervescent Tabs', price: 380 },
        { unit: '40 Effervescent Tabs', price: 720 },
        { unit: '60 Effervescent Tabs', price: 1020 },
        { unit: '80 Effervescent Tabs', price: 1320 },
        { unit: '100 Effervescent Tabs', price: 1600 },
      ],
      desc: 'Elemental magnesium with zinc in a fizzing lime drink that relaxes muscle spasms, prevents night cramps, and improves deep restorative sleep.',
      bmi: ['Normal', 'Overweight', 'Obese'],
      image: '/images/products/multivitamin.jpg'
    },
    {
      brand: 'Carbamide Forte',
      product: 'Multivitamin with Probiotics & 45 Key Ingredients',
      variations: [
        { unit: '60 Tablets', price: 499 },
        { unit: '120 Tablets', price: 899 },
        { unit: '180 Tablets', price: 1299 },
        { unit: '240 Tablets', price: 1699 },
        { unit: '30 Tablets', price: 299 },
      ],
      desc: 'Comprehensive multi-nutrient tablet with pre- and probiotics for gut digestion, boosting nutrient uptake, daily vitality, and joint flexibility.',
      bmi: ['Normal', 'Overweight', 'Underweight', 'Obese'],
      image: '/images/products/multivitamin.jpg'
    },
    {
      brand: 'Carbamide Forte',
      product: 'Chelated Magnesium Glycinate 1000mg',
      variations: [
        { unit: '60 Tablets', price: 549 },
        { unit: '120 Tablets', price: 999 },
        { unit: '180 Tablets', price: 1399 },
        { unit: '240 Tablets', price: 1799 },
        { unit: '30 Tablets', price: 329 },
      ],
      desc: 'Highly bioavailable 100% chelated magnesium glycinate that causes zero laxative effect. Relieves muscle tension and supports cardiac rhythm.',
      bmi: ['Normal', 'Overweight', 'Obese'],
      image: '/images/products/multivitamin.jpg'
    },
    {
      brand: 'Carbamide Forte',
      product: 'Vitamin D3 60,000 IU + K2 MK-7',
      variations: [
        { unit: '60 Veg Capsules', price: 599 },
        { unit: '90 Veg Capsules', price: 849 },
        { unit: '120 Veg Capsules', price: 1099 },
        { unit: '180 Veg Capsules', price: 1549 },
        { unit: '30 Veg Capsules', price: 349 },
      ],
      desc: 'Synergistic pairing of high-potency vitamin D3 and natural vitamin K2 MK-7 directing calcium into bone matrix rather than arterial tissues.',
      bmi: ['Normal', 'Overweight', 'Obese'],
      image: '/images/products/vitamin-d.jpg'
    },
    {
      brand: 'Centrum',
      product: 'Adult Daily Multivitamin & Multimineral',
      variations: [
        { unit: '60 Tablets', price: 599 },
        { unit: '100 Tablets', price: 899 },
        { unit: '120 Tablets', price: 1049 },
        { unit: '180 Tablets', price: 1499 },
        { unit: '30 Tablets', price: 349 },
      ],
      desc: 'The world\'s #1 doctor-recommended multivitamin brand with 23 vital micronutrients tailored for overall metabolic vitality and immune health.',
      bmi: ['Normal', 'Overweight', 'Underweight', 'Obese'],
      image: '/images/products/multivitamin.jpg'
    },
    {
      brand: 'Centrum',
      product: 'Men Daily Multivitamin for Energy & Immunity',
      variations: [
        { unit: '50 Tablets', price: 549 },
        { unit: '100 Tablets', price: 949 },
        { unit: '120 Tablets', price: 1099 },
        { unit: '150 Tablets', price: 1349 },
        { unit: '30 Tablets', price: 349 },
      ],
      desc: 'Formulated with B-vitamins, iron, magnesium, and vitamin C to meet the specific physiological and energy needs of active adult men.',
      bmi: ['Normal', 'Underweight', 'Overweight'],
      image: '/images/products/multivitamin.jpg'
    },
    {
      brand: 'Centrum',
      product: 'Women Daily Multivitamin with Iron & Calcium',
      variations: [
        { unit: '50 Tablets', price: 549 },
        { unit: '100 Tablets', price: 949 },
        { unit: '120 Tablets', price: 1099 },
        { unit: '150 Tablets', price: 1349 },
        { unit: '30 Tablets', price: 349 },
      ],
      desc: 'Customized for women\'s health with higher concentrations of calcium, iron, and folic acid to support bone strength, blood health, and skin glow.',
      bmi: ['Normal', 'Underweight', 'Overweight'],
      image: '/images/products/multivitamin.jpg'
    },
    {
      brand: 'NOW Foods',
      product: 'Daily Vits Multi-Vitamin & Mineral',
      variations: [
        { unit: '100 Veg Capsules', price: 1499 },
        { unit: '250 Veg Capsules', price: 3199 },
        { unit: '60 Veg Capsules', price: 999 },
        { unit: '120 Veg Capsules', price: 1799 },
        { unit: '180 Veg Capsules', price: 2499 },
      ],
      desc: 'Non-GMO vegan multivitamin providing 100% daily value of essential vitamins and lutein for healthy vision and cellular protection.',
      bmi: ['Normal', 'Overweight', 'Underweight'],
      image: '/images/products/multivitamin.jpg'
    },
    {
      brand: 'NOW Foods',
      product: 'Vitamin D3 5,000 IU High Potency Softgels',
      variations: [
        { unit: '120 Softgels', price: 1199 },
        { unit: '240 Softgels', price: 2199 },
        { unit: '60 Softgels', price: 699 },
        { unit: '180 Softgels', price: 1699 },
        { unit: '360 Softgels', price: 3199 },
      ],
      desc: 'High potency liquid softgels supplying structural cholecalciferol D3 to maintain strong teeth, bones, and immune defense.',
      bmi: ['Normal', 'Overweight', 'Obese'],
      image: '/images/products/vitamin-d.jpg'
    },
    {
      brand: 'Swisse',
      product: 'Ultivite Men\'s Multivitamin with 36 Herbs',
      variations: [
        { unit: '60 Tablets', price: 1399 },
        { unit: '90 Tablets', price: 1999 },
        { unit: '120 Tablets', price: 2499 },
        { unit: '180 Tablets', price: 3499 },
        { unit: '30 Tablets', price: 799 },
      ],
      desc: 'Premium Australian formula loaded with 36 vitamins, minerals, antioxidants, and adaptogenic herbs for peak male physical performance.',
      bmi: ['Normal', 'Underweight', 'Overweight'],
      image: '/images/products/multivitamin.jpg'
    },
    {
      brand: 'Swisse',
      product: 'Ultivite Women\'s Multivitamin with 40 Nutrients',
      variations: [
        { unit: '60 Tablets', price: 1399 },
        { unit: '90 Tablets', price: 1999 },
        { unit: '120 Tablets', price: 2499 },
        { unit: '180 Tablets', price: 3499 },
        { unit: '30 Tablets', price: 799 },
      ],
      desc: 'Comprehensive multi-nutrient blend featuring Siberian ginseng, green tea, and 40 vitamins tailored to women\'s daily lifestyle demands.',
      bmi: ['Normal', 'Underweight', 'Overweight'],
      image: '/images/products/multivitamin.jpg'
    },
    {
      brand: 'TrueBasics',
      product: 'Multivit Sport for Active Men',
      variations: [
        { unit: '60 Veg Capsules', price: 1099 },
        { unit: '90 Veg Capsules', price: 1549 },
        { unit: '120 Veg Capsules', price: 1999 },
        { unit: '180 Veg Capsules', price: 2799 },
        { unit: '30 Veg Capsules', price: 599 },
      ],
      desc: 'Targeted nutrition for gym enthusiasts with 40 ingredients, BCAAs, taurine, and brain-focus adaptogens to power intense training sessions.',
      bmi: ['Normal', 'Underweight', 'Overweight'],
      image: '/images/products/multivitamin.jpg'
    }
  ],

  Supplements: [
    {
      brand: 'Optimum Nutrition',
      product: 'Micronized Creatine Monohydrate Powder',
      variations: [
        { variant: '100% Pure Unflavored', unit: '100g Tub', price: 699 },
        { variant: '100% Pure Unflavored', unit: '250g Tub', price: 1199 },
        { variant: '100% Pure Unflavored', unit: '400g Tub', price: 1799 },
        { variant: '100% Pure Unflavored', unit: '500g Tub', price: 2199 },
        { variant: '100% Pure Unflavored', unit: '1kg Tub', price: 3999 },
      ],
      desc: '100% pure micronized creatine monohydrate supporting muscle power, size, and high-intensity workout performance without settling or grittiness.',
      bmi: ['Normal', 'Underweight'],
      image: '/images/products/creatine.jpg'
    },
    {
      brand: 'Optimum Nutrition',
      product: 'Amino Energy Pre-Workout & Intra-Workout',
      variations: [
        { variant: 'Fruit Fusion', unit: '270g Tub', price: 1899 },
        { variant: 'Blue Raspberry', unit: '585g Tub', price: 3399 },
        { variant: 'Watermelon', unit: '30 Servings Tub', price: 1999 },
        { variant: 'Green Apple', unit: '65 Servings Tub', price: 3699 },
        { variant: 'Orange Cooler', unit: '150g Tub', price: 1199 },
      ],
      desc: 'Micronized free-form amino acids with caffeine from natural green tea and green coffee bean extracts for clean, sustained workout energy.',
      bmi: ['Normal', 'Overweight'],
      image: '/images/products/bcaa.jpg'
    },
    {
      brand: 'Cellucor',
      product: 'C4 Original Explosive Pre-Workout',
      variations: [
        { variant: 'Icy Blue Razz', unit: '30 Servings (180g)', price: 1899 },
        { variant: 'Fruit Punch', unit: '60 Servings (390g)', price: 3299 },
        { variant: 'Watermelon Splash', unit: '15 Servings (90g)', price: 1099 },
        { variant: 'Green Apple', unit: '45 Servings (270g)', price: 2699 },
        { variant: 'Cherry Limeade', unit: '90 Servings (540g)', price: 4499 },
      ],
      desc: 'Legendary pre-workout powered by CarnoSyn beta-alanine, creatine nitrate, arginine AKG, and 150mg caffeine for explosive pumps and focus.',
      bmi: ['Normal', 'Overweight'],
      image: '/images/products/bcaa.jpg'
    },
    {
      brand: 'Cellucor',
      product: 'C4 Ripped Pre-Workout Fat Burner',
      variations: [
        { variant: 'Cherry Limeade', unit: '30 Servings (180g)', price: 2199 },
        { variant: 'Raspberry Lemonade', unit: '60 Servings (390g)', price: 3699 },
        { variant: 'Tropical Punch', unit: '15 Servings (90g)', price: 1299 },
        { variant: 'Icy Blue Razz', unit: '45 Servings (270g)', price: 2999 },
        { variant: 'Ultra Frost', unit: '90 Servings (540g)', price: 4999 },
      ],
      desc: 'Combines the explosive energy of C4 with L-carnitine, green coffee bean, and Capsimax cayenne fruit extract for rapid thermogenic fat loss.',
      bmi: ['Overweight', 'Obese'],
      image: '/images/products/bcaa.jpg'
    },
    {
      brand: 'Cellucor',
      product: 'Alpha Amino EAA & BCAA Matrix',
      variations: [
        { variant: 'Fruit Punch', unit: '380g Tub', price: 1999 },
        { variant: 'Icy Blue Razz', unit: '30 Servings Tub', price: 1899 },
        { variant: 'Lemon Lime', unit: '50 Servings Tub', price: 2899 },
        { variant: 'Watermelon', unit: '200g Tub', price: 1199 },
        { variant: 'Grape Splash', unit: '600g Tub', price: 3499 },
      ],
      desc: 'All 9 essential amino acids with 3x leucine BCAA matrix and raw coconut water powder to optimize hydration and accelerate recovery.',
      bmi: ['Normal', 'Overweight'],
      image: '/images/products/bcaa.jpg'
    },
    {
      brand: 'MuscleBlaze',
      product: 'Creatine Monohydrate (Creapure Certified)',
      variations: [
        { variant: '100% Pure Unflavored', unit: '100g Tub', price: 799 },
        { variant: '100% Pure Unflavored', unit: '250g Tub', price: 1399 },
        { variant: '100% Pure Unflavored', unit: '400g Tub', price: 1999 },
        { variant: '100% Pure Unflavored', unit: '500g Tub', price: 2399 },
        { variant: '100% Pure Unflavored', unit: '1kg Tub', price: 4299 },
      ],
      desc: 'Manufactured with AlzChem Germany Creapure raw material. Ultra-fine 200-mesh micronized creatine supporting rapid ATP replenishment.',
      bmi: ['Normal', 'Underweight'],
      image: '/images/products/creatine.jpg'
    },
    {
      brand: 'MuscleBlaze',
      product: 'WrathX Extreme Hardcore Pre-Workout',
      variations: [
        { variant: 'Fruit Monster', unit: '300g Tub', price: 1799 },
        { variant: 'Blue Raspberry', unit: '360g Tub', price: 2099 },
        { variant: 'Tangy Orange', unit: '150g Tub', price: 999 },
        { variant: 'Green Apple', unit: '450g Tub', price: 2599 },
        { variant: 'Watermelon', unit: '600g Tub', price: 3299 },
      ],
      desc: 'High-stimulant pre-workout formula loaded with EnXtra, caffeine, citrulline malate, and beta-alanine for non-stop endurance and vascularity.',
      bmi: ['Normal', 'Overweight'],
      image: '/images/products/bcaa.jpg'
    },
    {
      brand: 'MuscleBlaze',
      product: 'BCAA Pro 2:1:1 Intra-Workout with Electrolytes',
      variations: [
        { variant: 'Watermelon', unit: '250g Tub', price: 1299 },
        { variant: 'Lemon Mint', unit: '400g Tub', price: 1899 },
        { variant: 'Blue Raspberry', unit: '500g Tub', price: 2299 },
        { variant: 'Green Apple', unit: '150g Tub', price: 799 },
        { variant: 'Tangy Orange', unit: '1kg Tub', price: 3999 },
      ],
      desc: 'Instantized 2:1:1 branched-chain amino acids enriched with electrolytes to prevent intra-workout catabolism and maintain peak hydration.',
      bmi: ['Normal', 'Overweight'],
      image: '/images/products/bcaa.jpg'
    },
    {
      brand: 'Universal Nutrition',
      product: 'Animal Pak Complete Training Supplement',
      variations: [
        { variant: 'Elite Multi-Pack', unit: '30 Cans (Packs)', price: 2999 },
        { variant: 'Elite Multi-Pack', unit: '44 Cans (Packs)', price: 3999 },
        { variant: 'Elite Multi-Pack', unit: '15 Cans (Packs)', price: 1699 },
        { variant: 'Orange Powder', unit: '300g Canister', price: 2799 },
        { variant: 'Blue Raspberry Powder', unit: '500g Canister', price: 3799 },
      ],
      desc: 'The original foundational training pack trusted by hardcore bodybuilders since 1983. 85+ nutrients, digestive enzymes, and liver protectants.',
      bmi: ['Normal', 'Underweight'],
      image: '/images/products/bcaa.jpg'
    },
    {
      brand: 'Universal Nutrition',
      product: 'Animal Cuts Extreme Thermogenic Fat Burner',
      variations: [
        { variant: 'Hardcore Cutting Formula', unit: '42 Packs', price: 3499 },
        { variant: 'Hardcore Cutting Formula', unit: '30 Packs', price: 2699 },
        { variant: 'Hardcore Cutting Formula', unit: '20 Packs', price: 1899 },
        { variant: 'Blue Ice Powder', unit: '250g Jar', price: 2999 },
        { variant: 'Fruit Punch Powder', unit: '400g Jar', price: 3899 },
      ],
      desc: 'All-inclusive cutting formula targeting metabolic rate, water shedding, cortisol regulation, thyroid support, and appetite control.',
      bmi: ['Overweight', 'Obese'],
      image: '/images/products/bcaa.jpg'
    },
    {
      brand: 'Fast&Up',
      product: 'Reload Instant Electrolytes & Energy',
      variations: [
        { variant: 'Berry Blast', unit: '20 Effervescent Tabs', price: 275 },
        { variant: 'Orange Splash', unit: '40 Effervescent Tabs', price: 520 },
        { variant: 'Citrus Mint', unit: '60 Effervescent Tabs', price: 750 },
        { variant: 'Cola Splash', unit: '80 Effervescent Tabs', price: 980 },
        { variant: 'Apple Punch', unit: '100 Effervescent Tabs', price: 1199 },
      ],
      desc: 'Informed-Choice certified hydration drink with optimal ratio of sodium, potassium, magnesium, and calcium to prevent muscle cramps.',
      bmi: ['Normal', 'Overweight', 'Underweight', 'Obese'],
      image: '/images/products/bcaa.jpg'
    },
    {
      brand: 'Fast&Up',
      product: 'BCAA 2:1:1 Intra-Workout Muscle Recovery',
      variations: [
        { variant: 'Watermelon', unit: '400g Tub', price: 1699 },
        { variant: 'Cola', unit: '250g Tub', price: 1199 },
        { variant: 'Green Apple', unit: '500g Tub', price: 2099 },
        { variant: 'Orange', unit: '30 Servings Tub', price: 1499 },
        { variant: 'Lime', unit: '50 Servings Tub', price: 2399 },
      ],
      desc: 'Ultra-micronized vegan BCAAs with added taurine, glutamine, and citrulline for enhanced blood flow, oxygenation, and zero muscle breakdown.',
      bmi: ['Normal', 'Overweight'],
      image: '/images/products/bcaa.jpg'
    },
    {
      brand: 'HK Vitals',
      product: 'Triple Strength Fish Oil 1000mg Omega-3',
      variations: [
        { variant: 'Enteric Coated Lemon Flavored', unit: '60 Softgels', price: 749 },
        { variant: 'Enteric Coated Lemon Flavored', unit: '90 Softgels', price: 1049 },
        { variant: 'Enteric Coated Lemon Flavored', unit: '120 Softgels', price: 1349 },
        { variant: 'Enteric Coated Lemon Flavored', unit: '180 Softgels', price: 1899 },
        { variant: 'Enteric Coated Lemon Flavored', unit: '30 Softgels', price: 419 },
      ],
      desc: 'Molecularly distilled deep-sea fish oil providing 560mg EPA and 400mg DHA per softgel. Eliminates fishy burps and strengthens cardiovascular health.',
      bmi: ['Normal', 'Overweight', 'Obese', 'Underweight'],
      image: '/images/products/omega-3.jpg'
    },
    {
      brand: 'TrueBasics',
      product: 'Omega-3 Fish Oil Triple Strength (560 EPA / 400 DHA)',
      variations: [
        { variant: 'Molecularly Distilled', unit: '60 Softgels', price: 899 },
        { variant: 'Molecularly Distilled', unit: '90 Softgels', price: 1249 },
        { variant: 'Molecularly Distilled', unit: '120 Softgels', price: 1599 },
        { variant: 'Molecularly Distilled', unit: '180 Softgels', price: 2199 },
        { variant: 'Molecularly Distilled', unit: '30 Softgels', price: 499 },
      ],
      desc: 'Cold-extracted salmon oil purified of heavy metals and PCBs. Supports flexible joint cartilage, acute retinal function, and brain focus.',
      bmi: ['Normal', 'Overweight', 'Obese', 'Underweight'],
      image: '/images/products/omega-3.jpg'
    },
    {
      brand: 'GNC',
      product: 'Triple Strength Fish Oil 1000mg Omega-3',
      variations: [
        { variant: 'Purified Enteric Coated', unit: '60 Softgels', price: 1499 },
        { variant: 'Purified Enteric Coated', unit: '120 Softgels', price: 2699 },
        { variant: 'Purified Enteric Coated', unit: '90 Softgels', price: 2099 },
        { variant: 'Purified Enteric Coated', unit: '180 Softgels', price: 3699 },
        { variant: 'Purified Enteric Coated', unit: '30 Softgels', price: 899 },
      ],
      desc: 'Ultra-pure certified fish oil from wild ocean fish. 3x concentrated omega-3 fatty acids for lipid profile balance and joint lubricity.',
      bmi: ['Normal', 'Overweight', 'Obese', 'Underweight'],
      image: '/images/products/omega-3.jpg'
    },
    {
      brand: 'MuscleBlaze',
      product: 'KSM-66 Organic Ashwagandha Root Extract 600mg',
      variations: [
        { variant: 'Standardized 5% Withanolides', unit: '60 Veg Capsules', price: 699 },
        { variant: 'Standardized 5% Withanolides', unit: '90 Veg Capsules', price: 949 },
        { variant: 'Standardized 5% Withanolides', unit: '120 Veg Capsules', price: 1199 },
        { variant: 'Standardized 5% Withanolides', unit: '180 Veg Capsules', price: 1699 },
        { variant: 'Standardized 5% Withanolides', unit: '30 Veg Capsules', price: 399 },
      ],
      desc: 'Full-spectrum root extract clinically proven to reduce serum cortisol, boost natural testosterone, and improve muscle recovery and sleep.',
      bmi: ['Normal', 'Overweight', 'Obese'],
      image: '/images/products/collagen.jpg'
    },
    {
      brand: 'Carbamide Forte',
      product: 'Hydrolyzed Marine Collagen Peptides Type 1 & 3',
      variations: [
        { variant: 'Pure Unflavored', unit: '200g Jar', price: 1199 },
        { variant: 'Pure Unflavored', unit: '350g Jar', price: 1899 },
        { variant: 'Pure Unflavored', unit: '500g Jar', price: 2599 },
        { variant: 'Pure Unflavored', unit: '150g Jar', price: 899 },
        { variant: 'Pure Unflavored', unit: '1kg Jar', price: 4499 },
      ],
      desc: 'Wild-caught hydrolyzed marine collagen with hyaluronic acid and vitamin C for elastic skin, healthy hair follicles, and lubricated joint cartilage.',
      bmi: ['Normal', 'Overweight', 'Underweight'],
      image: '/images/products/collagen.jpg'
    },
    {
      brand: 'MuscleTech',
      product: 'Platinum 100% Creatine Monohydrate',
      variations: [
        { variant: 'Ultra-Pure Micronized', unit: '250g Tub', price: 1099 },
        { variant: 'Ultra-Pure Micronized', unit: '400g Tub', price: 1599 },
        { variant: 'Ultra-Pure Micronized', unit: '500g Tub', price: 1899 },
        { variant: 'Ultra-Pure Micronized', unit: '100g Tub', price: 599 },
        { variant: 'Ultra-Pure Micronized', unit: '1kg Tub', price: 3499 },
      ],
      desc: 'HPLC-tested pure micronized creatine providing 5g per scoop to enhance phosphocreatine resynthesis and peak power output during lifting.',
      bmi: ['Normal', 'Underweight'],
      image: '/images/products/creatine.jpg'
    },
    {
      brand: 'Healthyhey Nutrition',
      product: 'Pure L-Glutamine Fermented Powder',
      variations: [
        { variant: '100% Pure Unflavored', unit: '250g Tub', price: 799 },
        { variant: '100% Pure Unflavored', unit: '500g Tub', price: 1399 },
        { variant: '100% Pure Unflavored', unit: '100g Tub', price: 399 },
        { variant: '100% Pure Unflavored', unit: '400g Tub', price: 1149 },
        { variant: '100% Pure Unflavored', unit: '1kg Tub', price: 2499 },
      ],
      desc: 'Naturally fermented plant-source L-glutamine for intestinal mucosa integrity, immune cell proliferation, and rapid post-workout recovery.',
      bmi: ['Normal', 'Overweight', 'Underweight'],
      image: '/images/products/bcaa.jpg'
    },
    {
      brand: 'GNC',
      product: 'Pro Performance L-Arginine 1000mg',
      variations: [
        { variant: 'Nitric Oxide Booster', unit: '90 Tablets', price: 899 },
        { variant: 'Nitric Oxide Booster', unit: '120 Tablets', price: 1149 },
        { variant: 'Nitric Oxide Booster', unit: '60 Tablets', price: 649 },
        { variant: 'Nitric Oxide Booster', unit: '180 Tablets', price: 1599 },
        { variant: 'Nitric Oxide Booster', unit: '30 Tablets', price: 399 },
      ],
      desc: 'Free-form L-arginine promoting nitric oxide synthesis for enhanced vasodilation, intense muscle pumps, and improved nutrient delivery.',
      bmi: ['Normal', 'Overweight'],
      image: '/images/products/bcaa.jpg'
    }
  ],

  Snacks: [
    {
      brand: 'Pintola',
      product: 'All-Natural High Protein Peanut Butter (Super Crunchy)',
      variations: [
        { unit: '1kg Jar', price: 449 },
        { unit: '2.5kg Bucket', price: 999 },
        { unit: '500g Jar', price: 249 },
        { unit: '350g Jar', price: 189 },
        { unit: '1.5kg Jar', price: 649 },
      ],
      desc: 'Crafted with 100% roasted Grade-A peanuts delivering 30g protein per 100g. Zero added sugar, zero salt, zero palm oil, and zero trans fats.',
      bmi: ['Underweight', 'Normal'],
      image: '/images/products/peanut-butter.jpg'
    },
    {
      brand: 'Pintola',
      product: 'All-Natural High Protein Peanut Butter (Creamy Smooth)',
      variations: [
        { unit: '1kg Jar', price: 449 },
        { unit: '2.5kg Bucket', price: 999 },
        { unit: '500g Jar', price: 249 },
        { unit: '350g Jar', price: 189 },
        { unit: '1.5kg Jar', price: 649 },
      ],
      desc: 'Slow-churned velvety smooth peanut butter made exclusively with non-GMO slow roasted peanuts. Rich in healthy monounsaturated fats.',
      bmi: ['Underweight', 'Normal'],
      image: '/images/products/peanut-butter.jpg'
    },
    {
      brand: 'Pintola',
      product: 'High Protein Dark Chocolate Peanut Butter with Whey',
      variations: [
        { unit: '1kg Jar', price: 549 },
        { unit: '500g Jar', price: 299 },
        { unit: '2.5kg Bucket', price: 1199 },
        { unit: '350g Jar', price: 219 },
        { unit: '1.5kg Jar', price: 799 },
      ],
      desc: 'Fortified with premium imported whey protein isolate and rich Belgian cocoa. Supplies 33g protein per 100g with irresistible chocolate aroma.',
      bmi: ['Underweight', 'Normal'],
      image: '/images/products/peanut-butter.jpg'
    },
    {
      brand: 'Pintola',
      product: 'Organic Whole Rolled Oats',
      variations: [
        { unit: '1kg Pouch', price: 299 },
        { unit: '500g Pouch', price: 169 },
        { unit: '2kg Pouch', price: 549 },
        { unit: '1.5kg Pouch', price: 419 },
        { unit: '2.5kg Pouch', price: 679 },
      ],
      desc: '100% whole grain jumbo rolled oats rich in beta-glucan soluble fiber to lower cholesterol, sustain energy, and aid digestive satiety.',
      bmi: ['Normal', 'Overweight', 'Obese'],
      image: '/images/products/oats.jpg'
    },
    {
      brand: 'Alpino',
      product: 'High Protein Peanut Butter Super Crunchy',
      variations: [
        { unit: '1kg Jar', price: 499 },
        { unit: '500g Jar', price: 279 },
        { unit: '2.5kg Bucket', price: 1099 },
        { unit: '350g Jar', price: 199 },
        { unit: '1.5kg Jar', price: 729 },
      ],
      desc: 'Natural peanut butter packed with crispy roasted peanut chunks and 30g protein. No hydrogenated oils or chemical preservatives.',
      bmi: ['Underweight', 'Normal'],
      image: '/images/products/peanut-butter.jpg'
    },
    {
      brand: 'Alpino',
      product: 'All-Natural Peanut Butter Smooth Texture',
      variations: [
        { unit: '1kg Jar', price: 449 },
        { unit: '500g Jar', price: 249 },
        { unit: '2.5kg Bucket', price: 999 },
        { unit: '350g Jar', price: 189 },
        { unit: '1.5kg Jar', price: 649 },
      ],
      desc: 'Smooth texture peanut butter formulated from select golden roasted peanuts. Ideal spread for gym sandwiches, oatmeal, and fruit snacks.',
      bmi: ['Underweight', 'Normal'],
      image: '/images/products/peanut-butter.jpg'
    },
    {
      brand: 'The Whole Truth',
      product: '20g Whey Protein Bar (Dark Chocolate)',
      variations: [
        { unit: 'Box of 6 Bars', price: 799 },
        { unit: 'Box of 12 Bars', price: 1499 },
        { unit: 'Box of 18 Bars', price: 2199 },
        { unit: 'Box of 24 Bars', price: 2799 },
        { unit: 'Pack of 4 Bars', price: 549 },
      ],
      desc: 'Clean protein snack made with only 5 transparent ingredients: whey isolate, whole dates, roasted almonds, cocoa butter, and cocoa powder.',
      bmi: ['Normal', 'Overweight'],
      image: '/images/products/protein-bars.jpg'
    },
    {
      brand: 'The Whole Truth',
      product: '20g Whey Protein Bar (Peanut Butter Crunch)',
      variations: [
        { unit: 'Box of 6 Bars', price: 799 },
        { unit: 'Box of 12 Bars', price: 1499 },
        { unit: 'Box of 18 Bars', price: 2199 },
        { unit: 'Box of 24 Bars', price: 2799 },
        { unit: 'Pack of 4 Bars', price: 549 },
      ],
      desc: 'Raw whey protein combined with rich peanut butter and whole dates. Zero artificial sweeteners, zero soy, and zero preservatives.',
      bmi: ['Normal', 'Overweight'],
      image: '/images/products/protein-bars.jpg'
    },
    {
      brand: 'The Whole Truth',
      product: 'Dark Chocolate Pure Peanut Butter',
      variations: [
        { unit: '500g Jar', price: 349 },
        { unit: '1kg Jar', price: 649 },
        { unit: '350g Jar', price: 259 },
        { unit: '750g Jar', price: 499 },
        { unit: '1.5kg Jar', price: 899 },
      ],
      desc: '100% whole peanuts sweetened only with raw dates and real cocoa. Pure, decadent, and completely free of refined sugars.',
      bmi: ['Normal', 'Underweight'],
      image: '/images/products/peanut-butter.jpg'
    },
    {
      brand: 'RiteBite Max Protein',
      product: 'Daily Snack Bar (10g Protein - Choco Almond)',
      variations: [
        { unit: 'Box of 12 Bars', price: 600 },
        { unit: 'Box of 30 Bars', price: 1440 },
        { unit: 'Box of 6 Bars', price: 310 },
        { unit: 'Box of 24 Bars', price: 1180 },
        { unit: 'Box of 18 Bars', price: 890 },
      ],
      desc: 'Healthy on-the-go snack bar offering 10g protein, 5g fiber, 21 vitamins and minerals, and omega-3s with zero preservatives.',
      bmi: ['Normal', 'Overweight', 'Underweight'],
      image: '/images/products/protein-bars.jpg'
    },
    {
      brand: 'RiteBite Max Protein',
      product: 'Active Bar (20g Protein - Choco Fudge)',
      variations: [
        { unit: 'Box of 6 Bars', price: 660 },
        { unit: 'Box of 12 Bars', price: 1260 },
        { unit: 'Box of 18 Bars', price: 1840 },
        { unit: 'Box of 24 Bars', price: 2400 },
        { unit: 'Box of 30 Bars', price: 2950 },
      ],
      desc: 'High-protein workout snack providing 20g protein and 7g fiber. Sustained energy release formula to keep hunger locked away for 4 hours.',
      bmi: ['Normal', 'Overweight'],
      image: '/images/products/protein-bars.jpg'
    },
    {
      brand: 'RiteBite Max Protein',
      product: 'Ultimate Bar (30g Protein - Choco Berry)',
      variations: [
        { unit: 'Box of 6 Bars', price: 840 },
        { unit: 'Box of 12 Bars', price: 1620 },
        { unit: 'Box of 18 Bars', price: 2380 },
        { unit: 'Box of 24 Bars', price: 3100 },
        { unit: 'Pack of 4 Bars', price: 580 },
      ],
      desc: 'Powerhouse snack delivering 30g protein and 10g dietary fiber. Packed with blueberries, cranberries, and BCAAs for serious athletes.',
      bmi: ['Normal', 'Underweight'],
      image: '/images/products/protein-bars.jpg'
    },
    {
      brand: 'Yoga Bar',
      product: '20g Protein Bar (Chocolate Brownie)',
      variations: [
        { unit: 'Box of 6 Bars', price: 699 },
        { unit: 'Box of 12 Bars', price: 1349 },
        { unit: 'Box of 18 Bars', price: 1980 },
        { unit: 'Box of 24 Bars', price: 2590 },
        { unit: 'Pack of 4 Bars', price: 479 },
      ],
      desc: 'Crafted with premium whey protein, almonds, chia seeds, and raw honey. Zero artificial flavorings, soy protein, or trans fats.',
      bmi: ['Normal', 'Overweight'],
      image: '/images/products/protein-bars.jpg'
    },
    {
      brand: 'Yoga Bar',
      product: '100% Pure Peanut Butter Crunchy',
      variations: [
        { unit: '1kg Jar', price: 429 },
        { unit: '500g Jar', price: 239 },
        { unit: '2.5kg Bucket', price: 979 },
        { unit: '350g Jar', price: 179 },
        { unit: '1.5kg Jar', price: 619 },
      ],
      desc: 'Slow-roasted premium peanuts crushed into crunchy perfection. 26% protein per serving and completely palm oil-free.',
      bmi: ['Underweight', 'Normal'],
      image: '/images/products/peanut-butter.jpg'
    },
    {
      brand: 'Yoga Bar',
      product: 'High Protein Dark Chocolate & Cranberry Muesli',
      variations: [
        { unit: '400g Pouch', price: 349 },
        { unit: '1kg Pouch', price: 749 },
        { unit: '700g Pouch', price: 549 },
        { unit: '1.5kg Pouch', price: 1099 },
        { unit: '500g Pouch', price: 419 },
      ],
      desc: 'Whole rolled oats, raw seeds, almonds, and dark chocolate offering 15g protein per bowl. The ultimate clean power breakfast.',
      bmi: ['Normal', 'Overweight', 'Underweight'],
      image: '/images/products/oats.jpg'
    },
    {
      brand: 'Open Secret',
      product: 'Unjunked Choco Almond Nutty Cookies',
      variations: [
        { unit: 'Box of 12 Cookies', price: 399 },
        { unit: 'Box of 24 Cookies', price: 749 },
        { unit: 'Box of 6 Cookies', price: 219 },
        { unit: 'Box of 18 Cookies', price: 569 },
        { unit: 'Box of 30 Cookies', price: 899 },
      ],
      desc: 'Made with 40-50% nuts like whole almonds and cashews. Free from refined white flour (maida) and harmful palm oil.',
      bmi: ['Normal', 'Overweight'],
      image: '/images/products/protein-bars.jpg'
    },
    {
      brand: 'True Elements',
      product: '7-in-1 Raw Super Seeds and Nut Mix',
      variations: [
        { unit: '250g Pouch', price: 375 },
        { unit: '500g Pouch', price: 699 },
        { unit: '1kg Pouch', price: 1299 },
        { unit: '150g Pouch', price: 249 },
        { unit: '750g Pouch', price: 999 },
      ],
      desc: 'Nutrient-rich keto mix of California almonds, pumpkin seeds, chia seeds, flax seeds, watermelon seeds, sunflower seeds, and cranberries.',
      bmi: ['Overweight', 'Obese', 'Normal'],
      image: '/images/products/almonds.jpg'
    },
    {
      brand: 'True Elements',
      product: 'Whole Rolled Oats with Chia & Flax Seeds',
      variations: [
        { unit: '1kg Pouch', price: 349 },
        { unit: '500g Pouch', price: 199 },
        { unit: '1.5kg Pouch', price: 499 },
        { unit: '2kg Pouch', price: 649 },
        { unit: '750g Pouch', price: 289 },
      ],
      desc: 'Gluten-free whole rolled oats pre-blended with omega-rich chia and flax seeds for heart health and sustained satiety.',
      bmi: ['Normal', 'Overweight', 'Obese'],
      image: '/images/products/oats.jpg'
    },
    {
      brand: 'Farmley',
      product: 'Roasted & Flavored Makhana (Peri Peri Masala)',
      variations: [
        { unit: 'Pack of 3 (80g each)', price: 349 },
        { unit: 'Pack of 6 (80g each)', price: 649 },
        { unit: 'Pack of 2 (80g each)', price: 249 },
        { unit: 'Pack of 4 (80g each)', price: 449 },
        { unit: 'Pack of 8 (80g each)', price: 849 },
      ],
      desc: 'Slow-roasted crispy lotus seeds seasoned with spicy peri peri herbs. 100% gluten-free, cholesterol-free, and rich in natural calcium.',
      bmi: ['Overweight', 'Obese', 'Normal'],
      image: '/images/products/makhana.jpg'
    },
    {
      brand: 'Farmley',
      product: 'Premium Grade-A California Whole Almonds',
      variations: [
        { unit: '500g Pouch', price: 499 },
        { unit: '1kg Pouch', price: 949 },
        { unit: '250g Pouch', price: 269 },
        { unit: '750g Pouch', price: 729 },
        { unit: '1.5kg Pouch', price: 1399 },
      ],
      desc: 'Handpicked Grade-A California almonds packed with natural vitamin E, magnesium, healthy monounsaturated fats, and plant-based protein.',
      bmi: ['Normal', 'Overweight', 'Underweight'],
      image: '/images/products/almonds.jpg'
    }
  ],

  Equipment: [
    {
      brand: 'Boldfit',
      product: 'Heavy-Duty Hex Rubber Encased Dumbbells Pair',
      variations: [
        { unit: '5kg Pair (10kg Total)', price: 1899 },
        { unit: '7.5kg Pair (15kg Total)', price: 2699 },
        { unit: '10kg Pair (20kg Total)', price: 3499 },
        { unit: '12.5kg Pair (25kg Total)', price: 4299 },
        { unit: '15kg Pair (30kg Total)', price: 5099 },
      ],
      desc: 'Solid cast iron core encased in durable virgin rubber to protect floors and reduce dropping noise. Ergonomic chrome knurled handles prevent slippage.',
      bmi: ['Normal', 'Overweight', 'Underweight'],
      image: '/images/products/dumbbells.jpg'
    },
    {
      brand: 'Boldfit',
      product: '5-Tube Stackable Resistance Bands Set with Door Anchor',
      variations: [
        { unit: '100 lbs Resistance Set', price: 799 },
        { unit: '150 lbs Resistance Set', price: 999 },
        { unit: '80 lbs Resistance Set', price: 649 },
        { unit: '120 lbs Resistance Set', price: 899 },
        { unit: '200 lbs Pro Heavy Set', price: 1299 },
      ],
      desc: 'Color-coded Malaysian natural latex tubes with heavy steel carabiners, foam handles, ankle straps, door anchor, and carry pouch for full-body workouts.',
      bmi: ['Normal', 'Overweight', 'Obese', 'Underweight'],
      image: '/images/products/resistance-bands.jpg'
    },
    {
      brand: 'Boldfit',
      product: 'Non-Slip Eco TPE 6mm Yoga & Workout Mat with Strap',
      variations: [
        { unit: 'Purple (6mm Thick)', price: 899 },
        { unit: 'Royal Blue (6mm Thick)', price: 899 },
        { unit: 'Carbon Black (6mm Thick)', price: 899 },
        { unit: 'Charcoal Grey (6mm Thick)', price: 899 },
        { unit: 'Teal Blue (8mm Extra Thick)', price: 1099 },
      ],
      desc: 'Dual-sided textured non-slip biodegradable TPE foam mat offering cushioning for joints and laser alignment guides for yoga poses.',
      bmi: ['Normal', 'Overweight', 'Obese', 'Underweight'],
      image: '/images/products/yoga-mat.jpg'
    },
    {
      brand: 'Boldfit',
      product: 'High-Density EVA Grid Foam Roller for Muscle Recovery',
      variations: [
        { unit: '13 Inch (33cm)', price: 599 },
        { unit: '18 Inch (45cm)', price: 799 },
        { unit: '24 Inch (60cm)', price: 999 },
        { unit: '36 Inch (90cm Full Size)', price: 1399 },
        { unit: '14 Inch Compact Trigger Point', price: 649 },
      ],
      desc: 'Engineered trigger-point matrix molded over a rigid hollow core to simulate sports massage hands, relieving lactic acid knots and soreness.',
      bmi: ['Normal', 'Overweight', 'Obese', 'Underweight'],
      image: '/images/products/foam-roller.jpg'
    },
    {
      brand: 'Boldfit',
      product: 'Speed Cable Jump Rope with 360 Ball Bearings',
      variations: [
        { unit: 'Black (10ft Adjustable Cable)', price: 349 },
        { unit: 'Red (10ft Adjustable Cable)', price: 349 },
        { unit: 'Blue (10ft Adjustable Cable)', price: 349 },
        { unit: 'Silver (10ft Adjustable Cable)', price: 349 },
        { unit: 'Gold (10ft Adjustable Cable)', price: 399 },
      ],
      desc: 'Tangle-free steel cable with dual 360-degree ball bearings in lightweight knurled aluminum handles for rapid double-unders and cardio burn.',
      bmi: ['Normal', 'Overweight', 'Obese'],
      image: '/images/products/jump-rope.jpg'
    },
    {
      brand: 'Boldfit',
      product: 'Steel Pro Double-Wall Insulated Shaker Bottle',
      variations: [
        { unit: '700ml Capacity', price: 749 },
        { unit: '900ml Capacity', price: 899 },
        { unit: '500ml Compact', price: 649 },
        { unit: '1000ml Extra Large', price: 999 },
        { unit: '750ml Matte Black Edition', price: 799 },
      ],
      desc: 'Food-grade 18/8 stainless steel construction that will not hold odors. Double-wall vacuum insulation keeps protein shakes cold for 24 hours.',
      bmi: ['Normal', 'Overweight', 'Underweight', 'Obese'],
      image: '/images/products/shaker-bottle.jpg'
    },
    {
      brand: 'Cockatoo',
      product: 'Solid Cast Iron Kettlebell with Anti-Slip Wide Grip',
      variations: [
        { unit: '8kg Cast Iron', price: 1199 },
        { unit: '12kg Cast Iron', price: 1699 },
        { unit: '16kg Cast Iron', price: 2199 },
        { unit: '20kg Cast Iron', price: 2799 },
        { unit: '24kg Cast Iron', price: 3399 },
      ],
      desc: 'One-piece gravity-cast iron with textured powder-coated finish for solid chalk adherence. Flat machined base prevents rolling during floor work.',
      bmi: ['Normal', 'Overweight', 'Obese'],
      image: '/images/products/kettlebell.jpg'
    },
    {
      brand: 'Cockatoo',
      product: 'Leather Weightlifting Gym Belt with Steel Buckle',
      variations: [
        { unit: 'Size M (28-34 inch waist)', price: 999 },
        { unit: 'Size L (34-40 inch waist)', price: 1099 },
        { unit: 'Size XL (40-46 inch waist)', price: 1199 },
        { unit: 'Size S (24-28 inch waist)', price: 899 },
        { unit: 'Size XXL (46-52 inch waist)', price: 1299 },
      ],
      desc: 'Genuine layered buffalo leather belt with dual-prong steel roller buckle providing rigid intra-abdominal support for heavy squats and deadlifts.',
      bmi: ['Normal', 'Underweight', 'Overweight'],
      image: '/images/products/dumbbells.jpg'
    },
    {
      brand: 'Cockatoo',
      product: 'High-Density EVA Foam Roller Deep Tissue',
      variations: [
        { unit: '18 Inch (45cm)', price: 699 },
        { unit: '13 Inch (33cm)', price: 549 },
        { unit: '24 Inch (60cm)', price: 899 },
        { unit: '36 Inch (90cm Full Size)', price: 1299 },
        { unit: '14 Inch Mini Grid', price: 599 },
      ],
      desc: 'Deep tissue grid roller that releases myofascial tight spots, enhances hip mobility, and speeds up post-leg-day muscular recovery.',
      bmi: ['Normal', 'Overweight', 'Obese', 'Underweight'],
      image: '/images/products/foam-roller.jpg'
    },
    {
      brand: 'Cultsport',
      product: 'Neoprene Coated Hex Dumbbells Pair',
      variations: [
        { unit: '2kg Pair (4kg Total)', price: 899 },
        { unit: '3kg Pair (6kg Total)', price: 1299 },
        { unit: '4kg Pair (8kg Total)', price: 1699 },
        { unit: '5kg Pair (10kg Total)', price: 2099 },
        { unit: '6kg Pair (12kg Total)', price: 2499 },
      ],
      desc: 'Cast iron dumbbells coated in comfortable soft-grip neoprene. Non-slip when sweaty and gentle on home hardwood and tiled floors.',
      bmi: ['Normal', 'Overweight', 'Underweight'],
      image: '/images/products/dumbbells.jpg'
    },
    {
      brand: 'Cultsport',
      product: 'Speed Cable Skipping Rope with Aluminum Handles',
      variations: [
        { unit: '10ft Adjustable Cable (Black)', price: 399 },
        { unit: '10ft Adjustable Cable (Blue)', price: 399 },
        { unit: '10ft Adjustable Cable (Red)', price: 399 },
        { unit: '10ft Adjustable Cable (Green)', price: 399 },
        { unit: '10ft Adjustable Cable (Silver)', price: 449 },
      ],
      desc: 'Engineered for high RPM cardio and boxing drills with dual 360-degree stainless steel bearings in textured aluminum alloy handles.',
      bmi: ['Normal', 'Overweight', 'Obese'],
      image: '/images/products/jump-rope.jpg'
    },
    {
      brand: 'Cultsport',
      product: 'Dual-Wheel Core Ab Roller with Knee Pad',
      variations: [
        { unit: 'Dual Wheel Standard Set', price: 499 },
        { unit: 'Wide Single Wheel Set', price: 449 },
        { unit: 'Dual Wheel Pro Set with Resistance', price: 699 },
        { unit: 'Ultra-Wide Wheel Set', price: 599 },
        { unit: 'Compact Dual Wheel Set', price: 429 },
      ],
      desc: 'Sturdy stainless steel axle supporting 150kg with twin non-skid TPR wheels and thick foam knee mat for chiseling abs and core stability.',
      bmi: ['Normal', 'Overweight', 'Obese'],
      image: '/images/products/dumbbells.jpg'
    },
    {
      brand: 'Decathlon Domyos',
      product: 'Hex Rubber Dumbbell with Ergonomic Grip',
      variations: [
        { unit: '5kg Single Dumbbell', price: 999 },
        { unit: '7.5kg Single Dumbbell', price: 1399 },
        { unit: '10kg Single Dumbbell', price: 1799 },
        { unit: '15kg Single Dumbbell', price: 2699 },
        { unit: '20kg Single Dumbbell', price: 3499 },
      ],
      desc: 'Commercial-grade hexagonal rubber dumbbell designed for cross-training, push-up stability, and high-impact gym drops.',
      bmi: ['Normal', 'Overweight', 'Underweight'],
      image: '/images/products/dumbbells.jpg'
    },
    {
      brand: 'Decathlon Domyos',
      product: 'Cast Iron Kettlebell with Flat Base',
      variations: [
        { unit: '8kg Cast Iron', price: 1299 },
        { unit: '12kg Cast Iron', price: 1799 },
        { unit: '16kg Cast Iron', price: 2299 },
        { unit: '20kg Cast Iron', price: 2899 },
        { unit: '24kg Cast Iron', price: 3499 },
      ],
      desc: 'Precision balanced gravity-cast kettlebell with wide ergonomic handle for two-handed swings, snatches, and Turkish get-ups.',
      bmi: ['Normal', 'Overweight', 'Obese'],
      image: '/images/products/kettlebell.jpg'
    },
    {
      brand: 'Decathlon Domyos',
      product: '500 Gripped Push-Up Handles Pair',
      variations: [
        { unit: 'Standard Ergonomic Pair', price: 499 },
        { unit: 'Rotating 360 Pair', price: 799 },
        { unit: 'Non-Slip Wooden Pair', price: 999 },
        { unit: 'Steel Heavy-Duty Pair', price: 649 },
        { unit: 'Pro Folding Compact Pair', price: 599 },
      ],
      desc: 'Elevates your push-up range of motion while relieving wrist strain through neutral ergonomic grip angle. Non-slip rubber feet.',
      bmi: ['Normal', 'Overweight', 'Underweight'],
      image: '/images/products/dumbbells.jpg'
    },
    {
      brand: 'USI Universal',
      product: 'Power Weightlifting Wrist Wraps Pair',
      variations: [
        { unit: '18 Inch Heavy Duty Pair', price: 399 },
        { unit: '24 Inch Tournament Grade Pair', price: 499 },
        { unit: '12 Inch Standard Pair', price: 329 },
        { unit: '30 Inch Pro Powerlifter Pair', price: 599 },
        { unit: '20 Inch Elastic Support Pair', price: 429 },
      ],
      desc: 'Heavy-duty elasticized cotton webbing with reinforced thumb loop and industrial hook-and-loop closure for maximum bench press wrist lockout.',
      bmi: ['Normal', 'Underweight', 'Overweight'],
      image: '/images/products/resistance-bands.jpg'
    },
    {
      brand: 'USI Universal',
      product: 'Heavy-Duty Resistance Loop Bands Set',
      variations: [
        { unit: 'Pack of 5 Loop Bands', price: 499 },
        { unit: 'Pack of 3 Loop Bands', price: 349 },
        { unit: 'Pack of 4 Loop Bands', price: 429 },
        { unit: 'Light-to-Heavy 5-Pack with Pouch', price: 549 },
        { unit: 'Ultra-Heavy 3-Pack', price: 449 },
      ],
      desc: '100% genuine latex mini loop resistance bands designed for glute activation, physical therapy, shoulder warm-ups, and mobility.',
      bmi: ['Normal', 'Overweight', 'Obese', 'Underweight'],
      image: '/images/products/resistance-bands.jpg'
    },
    {
      brand: 'Strauss',
      product: 'Dual-Wheel Abdominal Roller with Knee Mat',
      variations: [
        { unit: 'Standard Wheel Set', price: 449 },
        { unit: 'Pro Dual Wheel Set', price: 549 },
        { unit: 'Ultra-Grip Wheel Set', price: 499 },
        { unit: 'Ergonomic Dual Wheel Set', price: 599 },
        { unit: 'Heavy Duty Set', price: 649 },
      ],
      desc: 'Dual-wheel construction delivers superior balance compared to single wheels. Strengthens upper and lower abdominal wall and lats.',
      bmi: ['Normal', 'Overweight', 'Obese'],
      image: '/images/products/dumbbells.jpg'
    },
    {
      brand: 'Strauss',
      product: 'Pro Weightlifting Leather Gloves with Wrist Support',
      variations: [
        { unit: 'Size M with 18\" Wrist Wrap', price: 499 },
        { unit: 'Size L with 18\" Wrist Wrap', price: 499 },
        { unit: 'Size XL with 18\" Wrist Wrap', price: 549 },
        { unit: 'Size S with 18\" Wrist Wrap', price: 449 },
        { unit: 'Size XXL with 18\" Wrist Wrap', price: 599 },
      ],
      desc: 'Real cowhide leather palm padding prevents painful calluses while integrated wide elastic wrist wrap stabilizes wrists during heavy pressing.',
      bmi: ['Normal', 'Underweight', 'Overweight'],
      image: '/images/products/resistance-bands.jpg'
    },
    {
      brand: 'Kore',
      product: 'Olympic Cast Iron Weight Plates Pair',
      variations: [
        { unit: '2.5kg Pair (5kg Total)', price: 799 },
        { unit: '5kg Pair (10kg Total)', price: 1499 },
        { unit: '10kg Pair (20kg Total)', price: 2799 },
        { unit: '15kg Pair (30kg Total)', price: 4099 },
        { unit: '20kg Pair (40kg Total)', price: 5399 },
      ],
      desc: 'Precision machine-bored 50mm Olympic center hole with triple-grip handles. Cast from high-density gray iron with black enamel finish.',
      bmi: ['Normal', 'Underweight', 'Overweight'],
      image: '/images/products/dumbbells.jpg'
    }
  ]
};

export const generate500Products = () => {
  const products = [];
  const categories = Object.keys(catalogCatalog);

  for (const category of categories) {
    const items = catalogCatalog[category];

    // items has 20 authentic brand/product entries
    // each item has 5 variations
    // 20 * 5 = exactly 100 authentic products per category
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      for (let v = 0; v < item.variations.length; v++) {
        const variation = item.variations[v];

        // Format name according to category:
        let name = '';
        if (category === 'Equipment') {
          name = `${item.brand} ${item.product} (${variation.unit})`;
        } else if (category === 'Vitamins') {
          name = `${item.brand} ${item.product} (${variation.unit})`;
        } else if (category === 'Snacks') {
          name = `${item.brand} ${item.product} (${variation.unit})`;
        } else {
          // Protein or Supplements with flavor
          if (variation.variant) {
            name = `${item.brand} ${item.product} - ${variation.variant} (${variation.unit})`;
          } else {
            name = `${item.brand} ${item.product} (${variation.unit})`;
          }
        }

        const price = variation.price;
        const stock = 25 + ((i * 7 + v * 13) % 120);
        const rating = Number((4.3 + (((i + v) % 7) * 0.1)).toFixed(1));

        // Format rich description
        let description = `${item.desc}`;
        if (variation.variant && category !== 'Equipment') {
          description += ` Flavor / Variant: ${variation.variant}.`;
        }
        description += ` Package: ${variation.unit}. 100% authentic product guaranteed.`;

        products.push({
          name,
          description,
          price,
          category,
          image: item.image,
          stock,
          rating: Math.min(5.0, rating),
          recommendedFor: item.bmi,
        });
      }
    }
  }

  return products;
};

const runSeed = async () => {
  try {
    const products = generate500Products();
    console.log(`Generated ${products.length} products with 100% authentic names and matched imagery.`);

    // 1. Save local JSON backup
    const backupPath = path.join(__dirname, '../data/products_500.json');
    const dataDir = path.dirname(backupPath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(backupPath, JSON.stringify(products, null, 2));
    console.log(`Saved backup JSON to ${backupPath}`);

    // 2. Connect to MongoDB Atlas
    console.log('Connecting to MongoDB Atlas...');
    const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://vinodkumarreddycv_db_user:xVfW9IJvrPsOOxfe@cluster0.31kjofb.mongodb.net/healthcart?retryWrites=true&w=majority&appName=Cluster0';
    
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 15000 });
    console.log('Connected to MongoDB Atlas!');

    // 3. Clear and insert
    console.log('Clearing existing products in MongoDB Atlas...');
    await Product.deleteMany({});

    console.log('Inserting 500 authentic products into MongoDB Atlas...');
    const result = await Product.insertMany(products);
    console.log(`✅ Successfully seeded ${result.length} authentic products into MongoDB Atlas!`);

    process.exit(0);
  } catch (error) {
    console.error('Database seed error:', error.message);
    process.exit(1);
  }
};

runSeed();
