'use client';

import React from 'react';

/**
 * Real-life tactile multi-layered SVG illustrations for Indian civic artifacts,
 * replacing generic system/AI emojis across Sarkari Sahayak.
 */

export function SchemesRegisterIcon({ className = 'w-11 h-11' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
      {/* Back folder sheet */}
      <rect x="10" y="6" width="42" height="52" rx="5" fill="#D97706" />
      {/* Main ivory gazette book */}
      <rect x="14" y="10" width="42" height="50" rx="5" fill="#FFFDF9" stroke="#78350F" strokeWidth="2.2" />
      {/* Tricolor official top header */}
      <path d="M15 15C15 12.7909 16.7909 11 19 11H51C53.2091 11 55 12.7909 55 15V17H15V15Z" fill="#FF9933" />
      <rect x="15" y="17" width="40" height="3" fill="#FFFFFF" />
      <rect x="15" y="20" width="40" height="3" fill="#138808" />
      {/* Official Gold Seal */}
      <circle cx="35" cy="31" r="5.5" fill="#FEF3C7" stroke="#B45309" strokeWidth="1.8" />
      <circle cx="35" cy="31" r="2" fill="#1E3A8A" />
      {/* Ruled text lines */}
      <rect x="21" y="40" width="28" height="2.8" rx="1.4" fill="#1E293B" />
      <rect x="21" y="46" width="22" height="2.6" rx="1.3" fill="#64748B" />
      <rect x="21" y="51.5" width="16" height="2.6" rx="1.3" fill="#047857" />
    </svg>
  );
}

export function CitizenProfileCheckIcon({ className = 'w-11 h-11' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
      {/* Citizen ID Card Base */}
      <rect x="6" y="12" width="52" height="40" rx="6" fill="#FFFDF9" stroke="#1E293B" strokeWidth="2.2" />
      {/* Top Saffron/Navy Header Strip */}
      <path d="M7 18C7 15.2386 9.23858 13 12 13H52C54.7614 13 57 15.2386 57 18V21H7V18Z" fill="#1E3A8A" />
      <rect x="7" y="21" width="50" height="2.5" fill="#F57C00" />
      {/* Citizen Portrait Frame */}
      <rect x="12" y="27" width="15" height="18" rx="3" fill="#E0F2FE" stroke="#0369A1" strokeWidth="1.6" />
      <circle cx="19.5" cy="33" r="3.5" fill="#0369A1" />
      <path d="M14 43C14 39.8 16.4 38 19.5 38C22.6 38 25 39.8 25 43" fill="#0369A1" />
      {/* Attribute Bars */}
      <rect x="31" y="28" width="20" height="3" rx="1.5" fill="#1E293B" />
      <rect x="31" y="34" width="15" height="2.5" rx="1.25" fill="#64748B" />
      <rect x="31" y="39.5" width="12" height="2.5" rx="1.25" fill="#047857" />
      {/* Verified Green Seal Badge */}
      <circle cx="49" cy="45" r="9" fill="#15803D" stroke="#FFFFFF" strokeWidth="2.2" />
      <path d="M45 45.2L47.8 48L53.5 42.3" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function DocumentFolderIcon({ className = 'w-11 h-11' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
      {/* Back Folder Tab */}
      <path d="M8 16C8 13.7909 9.79086 12 12 12H25L29 17H52C54.2091 17 56 18.7909 56 21V50C56 52.2091 54.2091 54 52 54H12C9.79086 54 8 52.2091 8 50V16Z" fill="#F59E0B" stroke="#78350F" strokeWidth="2" />
      {/* Peeking Aadhaar Card */}
      <rect x="15" y="10" width="34" height="26" rx="3" fill="#FFFFFF" stroke="#334155" strokeWidth="1.8" />
      <rect x="16" y="12" width="32" height="3" fill="#FF9933" />
      <rect x="16" y="15" width="32" height="2.5" fill="#138808" />
      <rect x="19" y="20" width="8" height="8" rx="1.5" fill="#CBD5E1" />
      <rect x="30" y="20" width="14" height="2.5" rx="1" fill="#1E293B" />
      <rect x="30" y="25" width="10" height="2.5" rx="1" fill="#DC2626" />
      {/* Front Manila Pocket */}
      <path d="M8 28H56V50C56 52.2091 54.2091 54 52 54H12C9.79086 54 8 52.2091 8 50V28Z" fill="#FDE68A" stroke="#78350F" strokeWidth="2" />
      {/* Official Stamp on Folder */}
      <rect x="22" y="36" width="20" height="10" rx="2.5" fill="#DCFCE7" stroke="#15803D" strokeWidth="1.8" />
      <path d="M27 41L30.2 44L37 38" stroke="#15803D" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function SchemeRealIcon({
  iconId,
  category,
  className = 'w-12 h-12',
}: {
  iconId?: string;
  category?: string;
  className?: string;
}) {
  const resolved = iconId || category || 'tractor_harvest';

  switch (resolved) {
    case 'tractor_harvest':
    case 'farmer':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
          {/* Warm Sun & Field */}
          <circle cx="48" cy="16" r="7" fill="#FBBF24" />
          <path d="M8 48H56" stroke="#15803D" strokeWidth="3" strokeLinecap="round" />
          {/* Tractor Body */}
          <path d="M18 36H34V24H24L20 31H18V36Z" fill="#16A34A" stroke="#14532D" strokeWidth="2" />
          <rect x="34" y="29" width="14" height="9" rx="2" fill="#22C55E" stroke="#14532D" strokeWidth="2" />
          {/* Exhaust Pipe */}
          <path d="M43 29V21H46" stroke="#1E293B" strokeWidth="2.5" strokeLinecap="round" />
          {/* Big Rear Wheel & Front Wheel */}
          <circle cx="24" cy="40" r="8" fill="#1E293B" stroke="#F59E0B" strokeWidth="2.5" />
          <circle cx="24" cy="40" r="3" fill="#FDE047" />
          <circle cx="44" cy="42" r="5.5" fill="#1E293B" stroke="#F59E0B" strokeWidth="2" />
          {/* Golden Wheat Stalk */}
          <path d="M12 44V22M9 26L12 29M15 26L12 29M9 32L12 35M15 32L12 35" stroke="#D97706" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      );

    case 'lpg_cylinder':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
          {/* Top Guard Ring */}
          <path d="M24 14H40V21H24V14Z" stroke="#991B1B" strokeWidth="2.5" fill="#FCA5A5" />
          {/* Brass Valve */}
          <rect x="29" y="16" width="6" height="5" fill="#F59E0B" stroke="#78350F" strokeWidth="1.5" />
          {/* Red Domestic LPG Cylinder Body */}
          <rect x="18" y="21" width="28" height="31" rx="8" fill="#DC2626" stroke="#7F1D1D" strokeWidth="2.2" />
          <line x1="18" y1="35" x2="46" y2="35" stroke="#FEF08A" strokeWidth="2.5" />
          {/* Base Ring */}
          <rect x="22" y="52" width="20" height="4" rx="1.5" fill="#7F1D1D" />
          {/* Blue Clean Flame Emblem */}
          <path d="M32 25C32 25 36 29 36 32C36 34.2 34.2 36 32 36C29.8 36 28 34.2 28 32C28 29 32 25 32 25Z" fill="#38BDF8" stroke="#FFFFFF" strokeWidth="1.2" />
        </svg>
      );

    case 'hospital_shield':
    case 'medicine_kit':
    case 'health':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
          {/* Protective Shield Base */}
          <path d="M32 8L52 15V31C52 44.5 43.2 53.6 32 57C20.8 53.6 12 44.5 12 31V15L32 8Z" fill="#ECFDF5" stroke="#047857" strokeWidth="2.4" />
          {/* Medical Cross */}
          <path d="M28 21H36V28H43V36H36V43H28V36H21V28H28V21Z" fill="#DC2626" stroke="#991B1B" strokeWidth="1.5" />
          {/* Golden Heartbeat Line */}
          <path d="M18 32H25L28 26L33 38L36 32H46" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );

    case 'brick_home':
    case 'housing':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
          {/* Terracotta Pitched Roof */}
          <path d="M8 30L32 11L56 30H8Z" fill="#EA580C" stroke="#7C2D12" strokeWidth="2.2" strokeLinejoin="round" />
          {/* Pucca House Walls */}
          <rect x="14" y="30" width="36" height="24" rx="2" fill="#FFFBEB" stroke="#78350F" strokeWidth="2.2" />
          {/* Wooden Door */}
          <rect x="27" y="38" width="10" height="16" rx="1.5" fill="#B45309" stroke="#78350F" strokeWidth="1.8" />
          {/* Windows */}
          <rect x="18" y="35" width="6" height="6" rx="1" fill="#38BDF8" stroke="#0284C7" strokeWidth="1.5" />
          <rect x="40" y="35" width="6" height="6" rx="1" fill="#38BDF8" stroke="#0284C7" strokeWidth="1.5" />
          {/* Green Base Lawn */}
          <path d="M8 54H56" stroke="#15803D" strokeWidth="3.5" strokeLinecap="round" />
        </svg>
      );

    case 'solar_roof':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
          {/* Bright Sun */}
          <circle cx="20" cy="16" r="6" fill="#FACC15" stroke="#CA8A04" strokeWidth="1.8" />
          {/* Solar Panel Tilted Array */}
          <polygon points="18,34 48,22 56,36 24,46" fill="#1D4ED8" stroke="#1E3A8A" strokeWidth="2" />
          <line x1="33" y1="28" x2="39" y2="41" stroke="#93C5FD" strokeWidth="1.6" />
          <line x1="22" y1="39" x2="52" y2="29" stroke="#93C5FD" strokeWidth="1.6" />
          {/* House Base */}
          <rect x="20" y="45" width="28" height="11" rx="1.5" fill="#FFFDF9" stroke="#334155" strokeWidth="2" />
          {/* Lightning Bolt Badge */}
          <path d="M46 10L41 18H46L44 25L51 16H46L46 10Z" fill="#F59E0B" />
        </svg>
      );

    case 'artisan_tools':
    case 'rural_work':
    case 'livelihood':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
          {/* Craftsman Gear / Wheel */}
          <circle cx="32" cy="32" r="18" fill="#FEF3C7" stroke="#B45309" strokeWidth="2.5" strokeDasharray="5 3" />
          {/* Crossed Hammer & Wrench */}
          <path d="M20 44L42 22" stroke="#78350F" strokeWidth="4.5" strokeLinecap="round" />
          <rect x="37" y="15" width="12" height="7" rx="1.5" transform="rotate(45 37 15)" fill="#475569" stroke="#1E293B" strokeWidth="1.8" />
          <path d="M44 44L22 22" stroke="#0F766E" strokeWidth="4" strokeLinecap="round" />
          <circle cx="20" cy="20" r="5" fill="#CCFBF1" stroke="#0F766E" strokeWidth="2" />
        </svg>
      );

    case 'street_cart':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
          {/* Striped Vendor Canopy */}
          <path d="M12 22L18 12H46L52 22H12Z" fill="#F97316" stroke="#9A3412" strokeWidth="2" />
          {/* Wooden Cart Bed */}
          <rect x="14" y="34" width="36" height="10" rx="2" fill="#B45309" stroke="#78350F" strokeWidth="2" />
          {/* Canopy Poles */}
          <line x1="17" y1="22" x2="17" y2="34" stroke="#78350F" strokeWidth="2.2" />
          <line x1="47" y1="22" x2="47" y2="34" stroke="#78350F" strokeWidth="2.2" />
          {/* Produce / Goods */}
          <circle cx="25" cy="30" r="4" fill="#22C55E" />
          <circle cx="33" cy="30" r="4" fill="#EF4444" />
          <circle cx="40" cy="30" r="4" fill="#EAB308" />
          {/* Spoked Cart Wheels */}
          <circle cx="22" cy="48" r="6" fill="#1E293B" stroke="#F59E0B" strokeWidth="2" />
          <circle cx="42" cy="48" r="6" fill="#1E293B" stroke="#F59E0B" strokeWidth="2" />
        </svg>
      );

    case 'graduation_cap':
    case 'scholar_book':
    case 'education':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
          {/* Hardcover Book Base */}
          <path d="M14 42C14 39.5 16 38 19 38H48V50H19C16 50 14 48.5 14 46V42Z" fill="#0284C7" stroke="#0C4A6E" strokeWidth="2" />
          <rect x="18" y="41" width="28" height="6" fill="#FFFDF9" />
          {/* Mortarboard Graduation Cap */}
          <polygon points="32,12 54,22 32,32 10,22" fill="#1E293B" stroke="#0F172A" strokeWidth="2" />
          <path d="M20 26V34C20 36.5 25.5 39 32 39C38.5 39 44 36.5 44 34V26" fill="#334155" stroke="#0F172A" strokeWidth="1.8" />
          {/* Golden Tassel */}
          <path d="M50 24V35" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="50" cy="36" r="2.5" fill="#F59E0B" />
        </svg>
      );

    case 'women_empowerment':
    case 'mother_child':
    case 'shg_women':
    case 'women':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
          {/* Warm Terracotta Circular Halo */}
          <circle cx="32" cy="32" r="22" fill="#FFF1F2" stroke="#BE123C" strokeWidth="2.2" />
          {/* Traditional Saree Silhouette */}
          <circle cx="32" cy="24" r="7" fill="#9F1239" />
          {/* Bindi */}
          <circle cx="32" cy="22.5" r="1.3" fill="#FBBF24" />
          <path d="M19 47C19 39 24.5 34 32 34C39.5 34 45 39 45 47" fill="#E11D48" stroke="#881337" strokeWidth="2" />
          {/* Golden Rupee Empowerment Badge */}
          <circle cx="46" cy="20" r="8" fill="#FEF3C7" stroke="#B45309" strokeWidth="1.8" />
          <text x="46" y="24" textAnchor="middle" fill="#92400E" fontSize="11" fontWeight="900">₹</text>
        </svg>
      );

    case 'mudra_bank':
    case 'kcc_card':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
          {/* Classical Bank Roof */}
          <polygon points="10,24 32,10 54,24" fill="#1E3A8A" stroke="#172554" strokeWidth="2" />
          <rect x="12" y="24" width="40" height="4" fill="#F59E0B" />
          {/* Pillars */}
          <rect x="16" y="28" width="5" height="18" fill="#E2E8F0" stroke="#334155" strokeWidth="1.6" />
          <rect x="29.5" y="28" width="5" height="18" fill="#E2E8F0" stroke="#334155" strokeWidth="1.6" />
          <rect x="43" y="28" width="5" height="18" fill="#E2E8F0" stroke="#334155" strokeWidth="1.6" />
          {/* Base Steps */}
          <rect x="10" y="46" width="44" height="6" rx="1.5" fill="#1E293B" />
          {/* Rupee Coin */}
          <circle cx="32" cy="19" r="4" fill="#FACC15" />
        </svg>
      );

    case 'pension_shield':
    case 'life_shield':
    case 'crop_shield':
    default:
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
          {/* Protective Umbrella Canopy */}
          <path d="M10 32C10 19.8 20 11 32 11C44 11 54 19.8 54 32H10Z" fill="#047857" stroke="#064E3B" strokeWidth="2.2" />
          {/* Umbrella Handle */}
          <path d="M32 32V48C32 51.3 29.5 53 27 53C24.5 53 23 51 23 48.5" stroke="#78350F" strokeWidth="3" strokeLinecap="round" />
          {/* Golden Rupee Shield */}
          <circle cx="44" cy="44" r="9" fill="#FEF3C7" stroke="#B45309" strokeWidth="2" />
          <text x="44" y="48" textAnchor="middle" fill="#92400E" fontSize="12" fontWeight="900">₹</text>
        </svg>
      );
  }
}

export function DocumentRealIcon({
  docId,
  className = 'w-10 h-10',
}: {
  docId: string;
  className?: string;
}) {
  switch (docId) {
    case 'aadhaar':
      return (
        <svg viewBox="0 0 48 48" fill="none" className={className} aria-hidden="true">
          <rect x="4" y="8" width="40" height="32" rx="4" fill="#FFFFFF" stroke="#1E293B" strokeWidth="2" />
          <rect x="5" y="10" width="38" height="3.5" fill="#FF9933" />
          <rect x="5" y="13.5" width="38" height="3" fill="#138808" />
          {/* Portrait */}
          <rect x="8" y="20" width="10" height="12" rx="1.5" fill="#E2E8F0" stroke="#475569" strokeWidth="1.4" />
          {/* QR Code */}
          <rect x="33" y="20" width="7" height="7" fill="#1E293B" />
          {/* 12-digit bar */}
          <rect x="21" y="21" width="9" height="2.5" rx="1" fill="#DC2626" />
          <rect x="21" y="26" width="9" height="2" rx="1" fill="#64748B" />
          <rect x="13" y="34" width="22" height="2.5" rx="1" fill="#0F172A" />
        </svg>
      );

    case 'bank':
      return (
        <svg viewBox="0 0 48 48" fill="none" className={className} aria-hidden="true">
          {/* Blue Bank Passbook */}
          <rect x="6" y="6" width="36" height="36" rx="4" fill="#1E3A8A" stroke="#0F172A" strokeWidth="2" />
          <rect x="10" y="6" width="4" height="36" fill="#F59E0B" />
          <rect x="18" y="13" width="18" height="7" rx="1.5" fill="#FFFDF9" />
          <circle cx="27" cy="29" r="5" fill="#FACC15" />
          <text x="27" y="32.5" textAnchor="middle" fill="#1E3A8A" fontSize="9" fontWeight="900">₹</text>
        </svg>
      );

    case 'ration':
      return (
        <svg viewBox="0 0 48 48" fill="none" className={className} aria-hidden="true">
          {/* Green Ration Booklet */}
          <rect x="8" y="5" width="32" height="38" rx="3.5" fill="#15803D" stroke="#052E16" strokeWidth="2" />
          <rect x="13" y="11" width="22" height="8" rx="1.5" fill="#FEF9C3" />
          {/* Wheat Crest */}
          <path d="M24 23V36M20 27L24 30M28 27L24 30M20 32L24 35M28 32L24 35" stroke="#FDE047" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      );

    case 'land':
      return (
        <svg viewBox="0 0 48 48" fill="none" className={className} aria-hidden="true">
          {/* 7/12 Land Survey Plot */}
          <rect x="7" y="5" width="34" height="38" rx="3" fill="#FFFBEB" stroke="#78350F" strokeWidth="2" />
          <path d="M12 16H36M12 26H36M23 16V36" stroke="#15803D" strokeWidth="1.8" />
          <rect x="13" y="17" width="9" height="8" fill="#BBF7D0" />
          <circle cx="32" cy="34" r="4" fill="#DC2626" />
        </svg>
      );

    case 'mobile':
      return (
        <svg viewBox="0 0 48 48" fill="none" className={className} aria-hidden="true">
          <rect x="13" y="5" width="22" height="38" rx="4" fill="#1E293B" stroke="#0F172A" strokeWidth="2" />
          <rect x="16" y="9" width="16" height="27" rx="1.5" fill="#E0F2FE" />
          {/* OTP Bubble */}
          <rect x="18" y="16" width="12" height="8" rx="2" fill="#F57C00" />
          <circle cx="24" cy="39.5" r="1.5" fill="#94A3B8" />
        </svg>
      );

    default:
      return (
        <svg viewBox="0 0 48 48" fill="none" className={className} aria-hidden="true">
          <rect x="8" y="5" width="32" height="38" rx="3" fill="#FFFDF9" stroke="#334155" strokeWidth="2" />
          <rect x="13" y="12" width="22" height="3" rx="1.5" fill="#F57C00" />
          <rect x="13" y="19" width="18" height="2.5" rx="1" fill="#475569" />
          <rect x="13" y="25" width="20" height="2.5" rx="1" fill="#475569" />
          <circle cx="31" cy="34" r="5" fill="#16A34A" />
        </svg>
      );
  }
}
