# Semester Progression & Student Degree Completion Algorithm

## 1. Overview
The platform dynamically calculates a student's degree progress, current academic milestone, and eligibility for semester advancement.

---

## 2. Mathematical Progression Model

### Degree Completion Percentage ($\%$)
$$\text{Progress} = \min\left(100, \left( \frac{\text{Current Semester}}{\text{Total Program Semesters}} \right) \times 100\right)$$

*Example Calculations:*
- **BCA Student in Semester 4 / 6**:
  $$\text{Progress} = \frac{4}{6} \times 100 = 66.7\%$$
- **B.Tech Student in Semester 5 / 8**:
  $$\text{Progress} = \frac{5}{8} \times 100 = 62.5\%$$
- **MBBS Student in Semester 7 / 9**:
  $$\text{Progress} = \frac{7}{9} \times 100 = 77.8\%$$

---

## 3. Time-Based Automated Upgrading Logic
1. **Semester Cycle**: Standard semester length is defined as **180 days (6 months)**.
2. **Elapsed Time Calculation**:
   $$\text{Elapsed Days} = \frac{\text{Current Date} - \text{Enrollment / Last Promotion Date}}{1000 \times 60 \times 60 \times 24}$$
3. **Upgrade Trigger**:
   - If $\text{Elapsed Days} \ge 180$ AND $\text{Current Semester} < \text{Total Program Semesters}$:
     - An **"Upgrade Ready"** notification badge is activated.
     - The system prompts the student or automatically promotes them to the next semester upon login.
4. **Graduation State**:
   - When $\text{Current Semester} = \text{Total Program Semesters}$ and term completes, the profile transitions to **"Alumnus / Graduate"** with an honored badge.
