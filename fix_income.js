const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://irdacjbfzoslibpuomrh.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlyZGFjamJmem9zbGlicHVvbXJoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDU4ODI3NywiZXhwIjoyMDkwMTY0Mjc3fQ.rra4G2bXeWiRH6KE7mh5Xxkacm01TtvOiHPz3uVYzew'
);

async function run() {
  // 1. Get all workers that exist but have no income_data
  const { data: workers, error } = await supabase
    .from('worker_profiles')
    .select('id, income_data!income_data_worker_id_fkey(worker_id)');
  
  if (error) {
    console.error(error);
    return;
  }

  const missingIncome = workers.filter(w => !w.income_data || w.income_data.length === 0);
  console.log(`Found ${missingIncome.length} workers missing income data.`);

  for (const w of missingIncome) {
    // Insert dummy income data
    const res = await supabase.from('income_data').insert({
      worker_id: w.id,
      avg_daily_earnings: Math.floor(Math.random() * (900 - 400 + 1) + 400),
      avg_weekly_earnings: Math.floor(Math.random() * (5000 - 2500 + 1) + 2500),
      avg_monthly_earnings: Math.floor(Math.random() * (20000 - 10000 + 1) + 10000),
      working_days_per_week: 6,
      city_zone: 'Default',
      zone_risk_level: 'Medium',
      income_tier: 'Standard'
    });
    if (res.error) {
       console.error(`Failed to insert income for ${w.id}:`, res.error);
    } else {
       console.log(`Restored income for ${w.id}`);
    }

    const res2 = await supabase.from('gig_profiles').insert({
      id: w.id,
      platform: 'Swiggy',
      tenure_months: Math.floor(Math.random() * 24 + 1)
    });
  }

  // Also check payment info
  const { data: pworkers, error: perror } = await supabase
    .from('worker_profiles')
    .select('id, payment_info(worker_id)');

  if (perror) {
      console.error(perror);
  } else {
    const missingPayment = pworkers.filter(w => !w.payment_info || w.payment_info.length === 0);
    console.log(`Found ${missingPayment.length} workers missing payment data.`);
    
    for (const w of missingPayment) {
      const res3 = await supabase.from('payment_info').insert({
        worker_id: w.id,
        upi_id: 'default@upi'
      });
      if (res3.error) {
        // Try the old id foreign key mapping
        const res4 = await supabase.from('payment_info').insert({
            id: w.id,
            worker_id: w.id,
            upi_id: 'default@upi'
          });
          if(res4.error) console.error("Payment insert failed", res4.error);
          else console.log(`Restored payment for ${w.id}`)
      } else {
        console.log(`Restored payment for ${w.id}`)
      }
    }
  }
}

run();
