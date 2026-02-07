import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function runPerformanceTest() {
  console.log('🚀 Starting performance test with Artillery...\n');

  try {
    const { stdout, stderr } = await execAsync('artillery run artillery-config.yml', {
      cwd: __dirname,
    });

    console.log(stdout);
    
    if (stderr) {
      console.error('Errors:', stderr);
    }

    // Parse results
    const p95Match = stdout.match(/p95:\s+(\d+\.?\d*)/);
    const errorMatch = stdout.match(/errors:\s+(\d+)/);
    const totalMatch = stdout.match(/scenarios completed:\s+(\d+)/);

    if (p95Match && totalMatch) {
      const p95 = parseFloat(p95Match[1]);
      const errors = errorMatch ? parseInt(errorMatch[1]) : 0;
      const total = parseInt(totalMatch[1]);
      const errorRate = (errors / total) * 100;

      console.log('\n📊 Performance Summary:');
      console.log('========================');
      console.log(`Response Time (p95): ${p95}ms ${p95 < 500 ? '✅' : '❌'} (Target: < 500ms)`);
      console.log(`Error Rate: ${errorRate.toFixed(2)}% ${errorRate < 1 ? '✅' : '❌'} (Target: < 1%)`);
      
      if (p95 < 500 && errorRate < 1) {
        console.log('\n✅ Performance test PASSED!');
        process.exit(0);
      } else {
        console.log('\n❌ Performance test FAILED!');
        process.exit(1);
      }
    }
  } catch (error: any) {
    console.error('❌ Error running performance test:', error.message);
    process.exit(1);
  }
}

runPerformanceTest();
