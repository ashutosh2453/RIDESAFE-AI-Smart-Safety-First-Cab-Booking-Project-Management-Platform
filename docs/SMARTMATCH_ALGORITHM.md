# RideSafe AI — SmartMatch & Fare Engine Specification

RideSafe AI replaces arbitrary dispatching with a deterministic, multi-factor scoring engine known as **SmartMatch**.

---

## 1. SmartMatch Driver Ranking Weights

When a passenger requests a ride or queries driver availability, candidate drivers are scored across five weighted dimensions:

| Dimension | Weight | Mathematical Basis | Description |
| :--- | :--- | :--- | :--- |
| **Proximity Score** | **30%** | $\max(0, 1 - \frac{d}{d_{\max}})$ | Distance between driver coordinates and passenger pickup location. |
| **Estimated ETA** | **25%** | $\max(0, 1 - \frac{\text{ETA}}{30})$ | Estimated minutes for driver to arrive at pickup spot. |
| **Historical Rating** | **20%** | $\frac{\text{Rating}}{5.0}$ | Aggregate customer satisfaction score (scale 1.0 to 5.0). |
| **Availability Status**| **15%** | $1.0 \text{ if AVAILABLE else } 0$ | Immediate readiness to accept dispatch. |
| **Vehicle Class Match**| **10%** | $1.0 \text{ if Type Match else } 0$ | Exact match with requested tier (`MINI`, `SEDAN`, `SUV`). |

### Total Score Formula:
$$\text{Score} = (0.30 \times S_{\text{dist}}) + (0.25 \times S_{\text{eta}}) + (0.20 \times S_{\text{rating}}) + (0.15 \times S_{\text{avail}}) + (0.10 \times S_{\text{vehicle}})$$

The driver achieving the highest normalized score is automatically assigned upon ride booking.

---

## 2. Dynamic Fare Calculation Model

Fares in RideSafe AI are fully transparent, with every component itemized for passenger clarity:

$$\text{Total Fare} = \left[ \text{Base Fare} + (D \times R_d) + (T \times R_t) \right] \times M_{\text{vehicle}}$$

### Parameters by Vehicle Category:

| Vehicle Class | Base Fare ($F_b$) | Rate per Km ($R_d$) | Rate per Min ($R_t$) | Multiplier ($M_v$) | Recommended For |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **MINI** | ₹50.00 | ₹12.00 / km | ₹2.00 / min | 1.00x | Solo commuters, short campus trips |
| **SEDAN** | ₹80.00 | ₹15.00 / km | ₹2.50 / min | 1.25x | Professional comfort, trunk luggage |
| **SUV** | ₹120.00 | ₹20.00 / km | ₹3.50 / min | 1.60x | Family groups, airport cargo |

### Example Calculation (Chennai Campus to Airport — 28.5 km, 45 mins, SEDAN):
- **Base Fare**: ₹80.00
- **Distance Component**: $28.5 \text{ km} \times ₹15.00 = ₹427.50$
- **Time Component**: $45 \text{ mins} \times ₹2.50 = ₹112.50$
- **Subtotal**: $₹80 + ₹427.50 + ₹112.50 = ₹620.00$
- **Vehicle Tier Adjustment**: $₹620.00 \times 1.25 = ₹775.00$
