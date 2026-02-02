import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { GameLevelsService } from './game-levels.service';
import { allGameLevels } from './seed-levels';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const gameLevelsService = app.get(GameLevelsService);

  console.log('🎮 Starting game levels seeding...');
  console.log(`📊 Total levels to seed: ${allGameLevels.length}`);

  try {
    // Clear existing levels
    console.log('🧹 Clearing existing levels...');

    const result = await gameLevelsService.createManyLevels(allGameLevels);

    console.log(`✅ Successfully seeded ${result.length} game levels!`);

    // Get counts per game
    const counts = await gameLevelsService.getAllLevelCounts();
    console.log('\n📈 Levels per game type:');
    Object.entries(counts).forEach(([game, count]) => {
      console.log(`   ${game}: ${count} levels`);
    });

  } catch (error) {
    console.error('❌ Error seeding levels:', error);
  }

  await app.close();
}

bootstrap();
